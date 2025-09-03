using System;
using System.Collections.Generic;
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
        private readonly CohereServices _cohere;

        public CommentsController(IPostService svc, CohereServices cohere)
        {
            _svc = svc;
            _cohere = cohere;
        }

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

        // 🔹 AI Reply Suggestions for a comment
        [HttpPost("suggest-replies")]
        public async Task<IActionResult> SuggestReplies(Guid postId, [FromBody] CommentSuggestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Text))
                return BadRequest("Comment text is required.");

            var replies = await _cohere.GetReplySuggestions(dto.Text);
            return Ok(replies);
        }
    }
}
