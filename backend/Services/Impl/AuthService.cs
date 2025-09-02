using System.Threading.Tasks;

using BlogApi.DTOs.Auth;
using BlogApi.Models;
using Microsoft.AspNetCore.Identity;

namespace BlogApi.Services.Impl
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AuthService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public async Task<ApplicationUser> LoginWithUserAsync(LoginDto dto)
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
    }
}
