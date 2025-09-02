using Microsoft.AspNetCore.Mvc;
using BlogApi.Models;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace BlogApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SummaryController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public SummaryController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost]
        public async Task<ActionResult<SummaryResult>> GenerateSummary([FromBody] SummaryInput input)
        {
            if (string.IsNullOrWhiteSpace(input.Text))
                return BadRequest("Input text is required.");

            var huggingFaceToken = "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"; // <-- Replace with your actual token

            try
            {
                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", huggingFaceToken);

                var payload = new { inputs = input.Text };
                var jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(
                    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errMsg = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, errMsg);
                }

                var responseContent = await response.Content.ReadAsStringAsync();

                var summaries = JsonSerializer.Deserialize<List<HuggingFaceSummary>>(responseContent);

                var summaryText = summaries?.FirstOrDefault()?.summary_text ?? "No summary generated.";

                return Ok(new SummaryResult { Summary = summaryText });
            }
            catch (HttpRequestException hre)
            {
                return StatusCode(503, $"External API error: {hre.Message}");
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
