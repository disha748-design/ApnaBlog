using System;
using System.Threading.Tasks;
using BlogApi.DTOs.Comments;
using BlogApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BlogApi.Controllers
{
    [ApiController]
    [Route("api/posts/{postId:guid}/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly IPostService _svc;
        public CommentsController(IPostService svc) => _svc = svc;

        private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // 🔹 Add a new comment
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<CommentResponseDto>> Add(Guid postId, [FromBody] CommentCreateDto dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var createdComment = await _svc.AddCommentAsync(postId, userId, dto.Content, dto.ParentCommentId);
            return Ok(createdComment);
        }

        // 🔹 Get all comments for a post
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CommentResponseDto>>> Get(Guid postId)
        {
            var comments = await _svc.GetCommentsAsync(postId);
            return Ok(comments);
        }
    }
}
