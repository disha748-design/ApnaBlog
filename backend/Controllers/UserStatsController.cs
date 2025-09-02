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
    public class UserStatsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserStatsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /api/UserStats/me
        [HttpGet("me")]
        public async Task<IActionResult> GetMyStats()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var totalPosts = await _context.Posts.CountAsync(p => p.AuthorId == userId);

            var mostCommented = await _context.Posts
                .Where(p => p.AuthorId == userId)
                .OrderByDescending(p => p.Comments.Count)
                .Select(p => new PostSummary
                {
                    Id = p.Id,
                    Title = p.Title,
                    CommentsCount = p.Comments.Count,
                    Views = p.Views.Count,
                    Likes = p.Likes.Count,
                })
                .FirstOrDefaultAsync();

            var mostViewed = await _context.Posts
                .Where(p => p.AuthorId == userId)
                .OrderByDescending(p => p.Views.Count)
                .Select(p => new PostSummary
                {
                    Id = p.Id,
                    Title = p.Title,
                    CommentsCount = p.Comments.Count,
                    Views = p.Views.Count,
                    Likes = p.Likes.Count
                })
                .FirstOrDefaultAsync();

            var mostLiked = await _context.Posts
                .Where(p => p.AuthorId == userId)
                .OrderByDescending(p => p.Likes.Count)
                .Select(p => new PostSummary
                {
                    Id = p.Id,
                    Title = p.Title,
                    CommentsCount = p.Comments.Count,
                    Views = p.Views.Count,
                    Likes = p.Likes.Count
                })
                .FirstOrDefaultAsync();

            var result = new UserStats
            {
                TotalPosts = totalPosts,
                MostCommentedPost = mostCommented,
                MostViewedPost = mostViewed,
                MostLikedPost = mostLiked
            };

            return Ok(result);
        }
    }
}
