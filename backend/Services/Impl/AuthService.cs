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
        public AuthService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IConfiguration config)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
        }

        public async Task<ApplicationUser?> LoginWithUserAsync(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !user.IsApproved) return null;

            var result = await _signInManager.PasswordSignInAsync(dto.Email, dto.Password, false, false);
            if (!result.Succeeded) return null;

            return user;
        }
        public async Task<IdentityResult> RegisterAsync(RegisterDto dto)
        {
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                DisplayName = dto.DisplayName,
                IsApproved = false, // new users must be approved first
                RequestedRole = string.IsNullOrEmpty(dto.RequestedRole) ? "User" : dto.RequestedRole
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            // ❌ DO NOT assign roles here
            // Roles will be given only when Admin approves user

            return result;
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
