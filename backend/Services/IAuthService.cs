using BlogApi.DTOs.Auth;
using BlogApi.Models;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace BlogApi.Services
{
    public interface IAuthService
    {
        Task<IdentityResult> RegisterAsync(RegisterDto dto);
        Task<bool> LoginAsync(LoginDto dto);
        Task LogoutAsync();

        Task<ApplicationUser> LoginWithUserAsync(LoginDto dto);
        Task<IList<string>> GetRolesAsync(ApplicationUser user);
    }
}
