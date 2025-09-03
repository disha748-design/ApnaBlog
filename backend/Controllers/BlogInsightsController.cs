using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BlogApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlogInsightsController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _cohereApiKey;

        public BlogInsightsController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _cohereApiKey = configuration["Cohere:ApiKey"];
        }

        [HttpGet("tips")]
        public async Task<IActionResult> GetTips()
        {
            var prompt = "Give me 5 short tips to increase blog engagement. Format each tip on a new line.";

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_cohereApiKey}");

            var requestBody = new
            {
                model = "command-r",
                message = prompt
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await client.PostAsync("https://api.cohere.ai/v1/chat", content);

            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "Cohere API failed.");

            var json = await response.Content.ReadAsStringAsync();
            var cohereResponse = JsonSerializer.Deserialize<CohereChatResponse>(json);

            return Ok(new { tips = cohereResponse.text.Trim() });
        }

        private class CohereChatResponse
        {
            public string response_id { get; set; }
            public string text { get; set; }
        }
    }
}
