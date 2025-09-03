using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace BlogApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TitleController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public TitleController(IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _httpClient = httpClientFactory.CreateClient();
            _apiKey = config["Cohere:ApiKey"]; // read from appsettings.json
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] BlogRequest request)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                return StatusCode(500, "Cohere API key is not configured.");

            if (string.IsNullOrWhiteSpace(request.Content))
                return BadRequest("Content cannot be empty.");

            // Updated prompt to enforce only title output
            var payload = new
            {
                model = "command",
                prompt = $"Generate a concise blog title for the following content. Do NOT add any extra text. Return only the title.\n\n{request.Content}",
                max_tokens = 40,
                temperature = 0.7
            };

            var json = JsonSerializer.Serialize(payload);
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.cohere.ai/v1/generate")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            httpRequest.Headers.Add("Authorization", $"Bearer {_apiKey}");

            var response = await _httpClient.SendAsync(httpRequest);

            if (!response.IsSuccessStatusCode)
            {
                var errorText = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, errorText);
            }

            var result = await response.Content.ReadAsStringAsync();
            var parsed = JsonSerializer.Deserialize<JsonElement>(result);

            if (parsed.TryGetProperty("generations", out var gens) && gens.GetArrayLength() > 0)
            {
                var rawTitle = gens[0].GetProperty("text").GetString()?.Trim() ?? "";

                // Take only the first line (in case extra text sneaks in)
                var firstLine = rawTitle.Split('\n')[0].Trim();

                // Remove any quotes if present
                var cleanTitle = firstLine.Trim('"', '\'');

                return Ok(new { title = cleanTitle });
            }

            return BadRequest("AI did not return a valid title.");
        }
    }

    public class BlogRequest
    {
        public string Content { get; set; }
    }
}
