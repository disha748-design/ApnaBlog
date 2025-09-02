using BlogApi.DTOs.Posts;
using BlogApi.Models;
using BlogApi.Services;
using BlogApi.Services.Impl;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace BlogApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly IPostService _svc;
        private readonly IWebHostEnvironment _env;

        public PostsController(IPostService svc, IWebHostEnvironment env)
        {
            _svc = svc;
            _env = env;
        }

        private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var userId = GetUserId();
            var p = await _svc.GetByIdAsync(id, userId);

            if (p == null) return NotFound();

            // Map Post to a DTO-like anonymous object
            var result = new
            {
                p.Id,
                p.Title,
                p.Content,
                AuthorId = p.AuthorId,
                AuthorUsername = p.Author?.UserName ?? "Unknown",
                Images = p.Images.Select(img => new { img.Url, img.FileName }).ToList(),
                p.CreatedAt,
                LikesCount = p.Likes.Count,
                CommentsCount = p.Comments.Count,
                ViewsCount = p.Views.Count
            };

            return Ok(result);
        }


        [Authorize]
        [HttpPost]
        [RequestSizeLimit(50_000_000)]
        public async Task<IActionResult> Create([FromForm] PostCreateDto dto, [FromForm] IFormFile[]? images)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            var p = await _svc.CreatePostAsync(userId, dto, images, _env.WebRootPath ?? "wwwroot");
            return Ok(p);
        }

        [Authorize]
        [HttpPut("{id:guid}")]
        [RequestSizeLimit(50_000_000)]
        public async Task<IActionResult> Edit(Guid id, [FromForm] PostCreateDto dto, [FromForm] IFormFile[]? images)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            var ok = await _svc.EditPostAsync(id, userId, dto, images, _env.WebRootPath ?? "wwwroot", byEditor: false);
            if (!ok) return Forbid();
            return Ok(new { message = "Edited (pending approval)" });
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Editor")]
        public async Task<IActionResult> GetPendingPosts()
        {
            // Fetch pending posts with Author and Images
            var pendingPosts = await _svc.GetPendingPostsAsync();

            // Map to DTO or return selected fields
            var result = pendingPosts.Select(p => new
            {
                p.Id,
                p.Title,
                p.Content,
                Author = p.Author != null ? new { p.Author.Id, p.Author.UserName } : null,
                Images = p.Images.Select(img => new { img.Url, img.FileName }).ToList(),
                CreatedAt = p.CreatedAt
            });

            return Ok(result);
        }


        [Authorize(Roles = "Editor")]
        [HttpPost("{id:guid}/approve")]
        public async Task<IActionResult> Approve(Guid id)
        {
            var editorId = GetUserId();
            if (editorId == null) return Unauthorized();
            var ok = await _svc.ApprovePostAsync(id, editorId);
            if (!ok) return NotFound();
            return Ok(new { message = "Post approved & published." });
        }
        [Authorize(Roles = "Editor")]
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> Reject(Guid id)
        {
            var editorId = GetUserId();
            if (editorId == null) return Unauthorized();

            var ok = await _svc.RejectPostAsync(id, editorId); // ✅
            if (!ok) return NotFound();
            return Ok(new { message = "Post rejected." });
        }


        [Authorize(Roles = "Editor")]
        [HttpPut("{id:guid}/edit-by-editor")]
        public async Task<IActionResult> EditByEditor(Guid id, [FromForm] PostCreateDto dto, [FromForm] IFormFile[]? images)
        {
            var editorId = GetUserId();
            if (editorId == null) return Unauthorized();
            var ok = await _svc.EditPostAsync(id, editorId, dto, images, _env.WebRootPath ?? "wwwroot", byEditor: true);
            if (!ok) return NotFound();
            return Ok(new { message = "Edited by editor" });
        }
        [HttpPut("{id}/submit-for-approval")]
        public async Task<IActionResult> SubmitForApproval(Guid id, [FromForm] PostEditDto dto)
        {
            var post = await _svc.GetByIdAsync(id);
            if (post == null) return NotFound("Post not found");

            var username = User.Identity?.Name;
            if (post.AuthorId != GetUserId())
                return Forbid("You are not authorized to edit this post");

            await _svc.SubmitEditForApprovalAsync(post, dto);

            return Ok(new { message = "Post submitted for editor approval" });
        }


        [HttpPost("{id:guid}/view")]
        public async Task<IActionResult> AddView(Guid id)
        {
            var userId = GetUserId();
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            await _svc.AddViewAsync(id, userId, ip);
            return Ok();
        }

        [Authorize]
        [HttpPost("{id:guid}/like")]
        public async Task<IActionResult> Like(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            await _svc.ToggleLikeAsync(id, userId);
            return Ok();
        }

        [Authorize]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var ok = await _svc.DeletePostAsync(id, userId);
            if (!ok) return Forbid("You are not authorized or post not found");

            return Ok(new { message = "Post deleted" });
        }

        [HttpGet("published")]
        public async Task<IActionResult> Published([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var posts = await _svc.GetPublishedAsync(page, pageSize);

            var result = posts.Select(p => new
            {
                p.Id,
                p.Title,
                p.Content,
                Author = p.Author != null ? new { p.Author.Id, p.Author.UserName } : null,
                Images = p.Images.Select(img => new { img.Url, img.FileName }).ToList(),
                p.CreatedAt
            });

            return Ok(result);
        }

    }
}
