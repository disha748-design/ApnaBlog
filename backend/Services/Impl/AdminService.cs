using APNABLOG_proj.DTOs;
using BlogApi.Models;
using BlogApi.Repositories;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
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

            // Remove all old roles first
            var existingRoles = await _userManager.GetRolesAsync(user);
            if (existingRoles.Count > 0)
                await _userManager.RemoveFromRolesAsync(user, existingRoles);

            // Assign only the final role
            await _userManager.AddToRoleAsync(user, finalRole);

            return true;
        }


    }
}
