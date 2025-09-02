using System;

using BlogApi.Services;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _svc;
        public AdminController(IAdminService svc) { _svc = svc; }

        [HttpGet("pending-users")]
        public async Task<IActionResult> PendingUsers() => Ok(await _svc.GetPendingUsersAsync());

        [HttpPost("approve/{userId}")]
        public async Task<IActionResult> Approve(string userId, [FromQuery] string role = "User")
        {
            var ok = await _svc.ApproveUserAsync(userId, role);
            if (!ok) return NotFound();
            return Ok(new { message = "User approved" });
        }
    }
}
