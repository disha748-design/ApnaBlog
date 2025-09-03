using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;

using System.Collections.Generic;
using System.Security.Claims;
using BlogApi.DTOs.Auth;
using BlogApi.Models;
using Microsoft.AspNetCore.Identity;

namespace BlogApi.Services.Impl
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _config;

        private readonly IRsaService _rsaService;
        public AuthService(
            UserManager<ApplicationUser> userManager, 
            SignInManager<ApplicationUser> signInManager, 
            IConfiguration config,
            IRsaService rsaService
            )
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
            _rsaService = rsaService;
        }

         public async Task<ApplicationUser?> LoginWithUserAsync(LoginDto dto)
{
    // Decrypt password if using RSA
    if (!string.IsNullOrEmpty(dto.Password))
    {
        try
        {
            dto.Password = _rsaService.Decrypt(dto.Password); // Inject IRsaService in AuthService constructor
        }
        catch (Exception ex)
        {
            // Log and return null
            Console.WriteLine("RSA decryption failed: " + ex.Message);
            return null;
        }
    }

    // Find user by email
    var user = await _userManager.FindByEmailAsync(dto.Email);
    if (user == null) return null;

    // Check password
    var passwordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
    if (!passwordValid) return null;

    await _signInManager.SignInAsync(user, isPersistent: true);

    return user; // Return nullable ApplicationUser?
}



 public async Task<IdentityResult> RegisterAsync(RegisterDto dto)
{
    var user = new ApplicationUser
    {
        DisplayName = dto.DisplayName,
        Email = dto.Email,
        UserName = dto.Email,
        RequestedRole = dto.RequestedRole,
        IsApproved = false
    };

    var result = await _userManager.CreateAsync(user, dto.Password);
    return result; // IdentityResult matches interface
}



        public async Task<bool> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) return false;
            if (!user.IsApproved) return false;

            var check = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: false);
            if (!check.Succeeded) return false;

            await _signInManager.SignInAsync(user, isPersistent: dto.RememberMe);
            return true;
        }

        public async Task LogoutAsync() => await _signInManager.SignOutAsync();
        public async Task<IList<string>> GetRolesAsync(ApplicationUser user)
        {
            return await _userManager.GetRolesAsync(user);
        }

        
         public async Task<bool> LoginAdminAsync(string email, string password)
        {
            var adminEmail = _config["AdminSeed:Email"];
            var adminPassword = _config["AdminSeed:Password"];

            if (email == adminEmail && password == adminPassword)
            {
                // Create claims principal for admin
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, email),
                    new Claim(ClaimTypes.Role, "Admin")
                };

                var identity = new ClaimsIdentity(claims, IdentityConstants.ApplicationScheme);
                var principal = new ClaimsPrincipal(identity);

                await _signInManager.Context.SignInAsync(
                    IdentityConstants.ApplicationScheme,
                    principal);

                return true;
            }

            return false;
        }
    }
}
