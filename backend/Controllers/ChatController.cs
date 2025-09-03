using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using BlogApi.Services;

namespace BlogApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // ✅ Only authenticated users with valid cookies can access
    public class ChatController : ControllerBase
    {
        private readonly CohereServices _cohere;

        public ChatController(CohereServices cohere)
        {
            _cohere = cohere;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] ChatRequest request)
        {
            if (request == null)
                return BadRequest("Request body is required.");

            var blogContent = request.BlogContent?.Trim() ?? "";
            var question = request.Question?.Trim() ?? "";

            if (string.IsNullOrWhiteSpace(blogContent) && string.IsNullOrWhiteSpace(question))
                return BadRequest("BlogContent and Question cannot both be empty.");

            try
            {
                // Call Cohere API
                var answer = await _cohere.ChatWithBlogAsync(blogContent, question);
                return Ok(new { response = answer });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class ChatRequest
    {
        public string BlogContent { get; set; }
        public string Question { get; set; }
    }
}
