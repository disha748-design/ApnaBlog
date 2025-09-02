using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BlogApi.Data;
using BlogApi.Models;

namespace BlogApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public UserProfileController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: /api/UserProfile/me
        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var profile = await _context.UserProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            // If profile doesn't exist, create it
            if (profile == null)
            {
                profile = new UserProfile
                {
                    UserId = userId,
                    AboutMe = "",
                    Preferences = "[]"
                };
                _context.UserProfiles.Add(profile);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                username = profile.User?.UserName ?? "",
                email = profile.User?.Email ?? "",
                about = profile.AboutMe ?? "",
                preferences = profile.Preferences ?? "[]",
                profileImageUrl = profile.ProfileImageUrl ?? ""
            });
        }


        // PUT: /api/UserProfile/me
        [HttpPut("me")]
        [RequestSizeLimit(10_000_000)] // limit upload size ~10MB
        public async Task<IActionResult> UpdateProfile([FromForm] UserProfileUpdateDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                profile = new UserProfile { UserId = userId };
                _context.UserProfiles.Add(profile);
            }

            profile.AboutMe = dto.AboutMe;
            profile.Preferences = dto.Preferences;

            // Handle profile image upload
            if (dto.ProfileImage != null && dto.ProfileImage.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "Uploads");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}_{dto.ProfileImage.FileName}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = System.IO.File.Create(filePath))
                {
                    await dto.ProfileImage.CopyToAsync(stream);
                }

                profile.ProfileImageUrl = $"/Uploads/{fileName}";
            }

            await _context.SaveChangesAsync();

            return Ok(profile);
        }
    }

    // DTO for updating profile
    public class UserProfileUpdateDto
    {
        public IFormFile ProfileImage { get; set; }
        public string AboutMe { get; set; }
        public string Preferences { get; set; } // comma-separated or JSON string
    }
}
