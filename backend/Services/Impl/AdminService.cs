using APNABLOG_proj.DTOs;
using BlogApi.Models;
using BlogApi.Repositories;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlogApi.Services.Impl
{
    public class AdminService : IAdminService
    {
        private readonly IUserRepository _userRepo;
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminService(IUserRepository userRepo, UserManager<ApplicationUser> userManager)
        {
            _userRepo = userRepo;
            _userManager = userManager;
        }

        public async Task<IEnumerable<PendingUserDto>> GetPendingUsersAsync()
        {
            var users = await _userRepo.GetPendingApprovalAsync();
            return users.Select(u => new PendingUserDto
            {
                Id = u.Id,
                Email = u.Email,
                DisplayName = u.DisplayName,
                RequestedRole = u.RequestedRole
            });
        }

        public async Task<bool> ApproveUserAsync(string userId, string? role = null)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            user.IsApproved = true;
            var update = await _userManager.UpdateAsync(user);
            if (!update.Succeeded) return false;

            // Decide final role
            var finalRole = role ?? user.RequestedRole ?? "User";

            // Remove old roles first
            var existingRoles = await _userManager.GetRolesAsync(user);
            if (existingRoles.Any())
                await _userManager.RemoveFromRolesAsync(user, existingRoles);

            // Assign final role
            await _userManager.AddToRoleAsync(user, finalRole);

            return true;
        }

        public async Task<bool> RejectUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            // Completely delete user from DB
            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }
    }
}
