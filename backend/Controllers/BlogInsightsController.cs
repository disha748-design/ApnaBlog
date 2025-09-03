using BlogApi.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
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

        [HttpGet("me")]
        public async Task<IActionResult> GetMyInsights()
        {
            try
            {
                // --- Fetch user stats with cookie auth ---
                var handler = new HttpClientHandler { UseCookies = true, CookieContainer = new System.Net.CookieContainer() };
                foreach (var cookie in Request.Cookies)
                {
                    handler.CookieContainer.Add(new Uri("http://localhost:5096"), new System.Net.Cookie(cookie.Key, cookie.Value));
                }

                var client = new HttpClient(handler);
                var statsResponse = await client.GetAsync("http://localhost:5096/api/UserStats/me");

                if (!statsResponse.IsSuccessStatusCode)
                    return StatusCode((int)statsResponse.StatusCode, "Failed to fetch user stats.");

                var statsJson = await statsResponse.Content.ReadAsStringAsync();
                var stats = JsonSerializer.Deserialize<UserStats>(statsJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (stats == null)
                    return Ok(new { tips = "No stats available for this user." });

                // --- Prompt ---
                var prompt = $@"
You are an AI assistant analyzing a user's blog stats.
Stats:
- Total Posts: {stats.TotalPosts},
- Most Viewed: {stats.MostViewedPost?.Title ?? "N/A"},
- Most Commented: {stats.MostCommentedPost?.Title ?? "N/A"},
- Most Liked: {stats.MostLikedPost?.Title ?? "N/A"}.
Give 2-3 actionable tips to help the user increase engagement.
";

                // --- Call Cohere ---
                var cohereClient = _httpClientFactory.CreateClient();
                cohereClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_cohereApiKey}");

                var cohereRequest = new
                {
                    model = "command-r7b-12-2024",
                    messages = new[]
                    {
                        new {
                            role = "user",
                            content = new object[] {
                                new { type = "text", text = prompt }
                            }
                        }
                    }
                };

                var requestContent = new StringContent(JsonSerializer.Serialize(cohereRequest), Encoding.UTF8, "application/json");
                var cohereResponse = await cohereClient.PostAsync("https://api.cohere.ai/v1/chat", requestContent);

                if (!cohereResponse.IsSuccessStatusCode)
                    return StatusCode((int)cohereResponse.StatusCode, await cohereResponse.Content.ReadAsStringAsync());

                var cohereJson = await cohereResponse.Content.ReadAsStringAsync();
                var cohereResult = JsonSerializer.Deserialize<CohereChatResponse>(cohereJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                var tips = cohereResult?.Message?.Content?.FirstOrDefault()?.Text ?? "No tips generated.";

                return Ok(new { tips });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error generating AI tips: {ex.Message}");
                return Ok(new { tips = "Unable to fetch insights right now." });
            }
        }

        // --- Cohere models ---
        private class CohereChatResponse
        {
            public CohereMessage Message { get; set; }
        }

        private class CohereMessage
        {
            public string Role { get; set; }
            public CohereContent[] Content { get; set; }
        }

        private class CohereContent
        {
            public string Type { get; set; }
            public string Text { get; set; }
        }
    }
}
