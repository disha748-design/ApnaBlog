using System;
using System.IO;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using BlogApi.Data;
using BlogApi.Models;
using BlogApi.Repositories;
using BlogApi.Repositories.Impl;
using BlogApi.Services;
using BlogApi.Services.Impl;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// ----- DB Context -----
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ----- Identity -----
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.SignIn.RequireConfirmedAccount = false; // we'll use IsApproved flag
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// ----- Configure cookie -----
builder.Services.ConfigureApplicationCookie(opts =>
{
    opts.Cookie.HttpOnly = true;
    opts.Cookie.SecurePolicy = CookieSecurePolicy.None;
    opts.Cookie.SameSite = SameSiteMode.Lax;
    opts.ExpireTimeSpan = TimeSpan.FromDays(7);
    opts.SlidingExpiration = true;
    opts.LoginPath = "/api/Auth/login";

    opts.Events.OnRedirectToLogin = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    opts.Events.OnRedirectToAccessDenied = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

// ----- Repositories & Services -----
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IPostService, PostService>();

// ----- AI Services -----
builder.Services.Configure<HuggingFaceSetting>(
    builder.Configuration.GetSection("HuggingFace"));
builder.Services.AddHttpClient<HuggingFaceServices>((sp, client) =>
{
    var settings = sp.GetRequiredService<IOptions<HuggingFaceSetting>>().Value;
    client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", settings.ApiKey);
});

builder.Services.AddHttpClient<CohereServices>();
builder.Services.AddScoped<CohereServices>();
builder.Services.AddSingleton<CohereServices>();

// ----- Controllers / Swagger -----
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ----- CORS -----
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Ensure wwwroot/Uploads exists
var uploadsPath = Path.Combine(app.Environment.WebRootPath ?? "wwwroot", "Uploads");
Directory.CreateDirectory(uploadsPath);

// Seed roles and admin user
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var roleMgr = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userMgr = services.GetRequiredService<UserManager<ApplicationUser>>();
    var config = services.GetRequiredService<IConfiguration>();

    string[] roles = new[] { "Admin", "Editor", "User" };
    foreach (var r in roles)
    {
        if (!await roleMgr.RoleExistsAsync(r))
            await roleMgr.CreateAsync(new IdentityRole(r));
    }

    var adminEmail = config["AdminSeed:Email"];
    var adminPassword = config["AdminSeed:Password"];
    if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminPassword))
    {
        var adminUser = await userMgr.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                DisplayName = "Admin",
                IsApproved = true
            };
            var create = await userMgr.CreateAsync(adminUser, adminPassword);
            if (create.Succeeded)
            {
                await userMgr.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }
}

// ----- Middleware -----
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseStaticFiles();

// ✅ Enable static files for /uploads folder
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
    RequestPath = "/uploads"
});
app.UseRouting();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
