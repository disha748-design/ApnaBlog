using System.Threading.Tasks;
using System.Collections.Generic;
using BlogApi.Models;
using APNABLOG_proj.DTOs;

namespace BlogApi.Services
{
    public interface IAdminService
    {
        Task<IEnumerable<PendingUserDto>> GetPendingUsersAsync();
        Task<bool> ApproveUserAsync(string userId, string role = "User");
        Task<bool> RejectUserAsync(string userId);
    }
}
