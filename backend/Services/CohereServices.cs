using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BlogApi.Services
{
    public class CohereServices
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly string _apiKey;

        public CohereServices(
            IHttpClientFactory httpClientFactory,
            IHttpContextAccessor httpContextAccessor,
            IConfiguration config)
        {
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
            _apiKey = config["Cohere:ApiKey"];
        }

        public async Task<string> ChatWithBlogAsync(
    string blogContent,
    string userQuestion,
    string userStatsUrl = "http://localhost:5096/api/UserStats/me")
        {
            if (string.IsNullOrWhiteSpace(blogContent))
                blogContent = "This blog contains placeholder content for testing.";

            if (string.IsNullOrWhiteSpace(userQuestion))
                return "❌ Question cannot be empty.";

            blogContent = blogContent.Trim();
            userQuestion = userQuestion.Trim();

            // --- Fetch user stats using cookie auth ---
            var client = _httpClientFactory.CreateClient();

            var cookies = _httpContextAccessor.HttpContext?.Request.Cookies;
            if (cookies != null)
            {
                var cookieHeader = string.Join("; ", cookies.Select(c => $"{c.Key}={c.Value}"));
                if (!string.IsNullOrEmpty(cookieHeader))
                    client.DefaultRequestHeaders.Add("Cookie", cookieHeader);
            }

            var statsResponse = await client.GetAsync(userStatsUrl);
            if (!statsResponse.IsSuccessStatusCode)
                return $"Failed to fetch user stats: {statsResponse.StatusCode}";

            var statsJson = await statsResponse.Content.ReadAsStringAsync();

            // --- Build prompt ---
            var prompt = $@"
You are an AI assistant analyzing a user's blog stats.
User Stats: {statsJson}
Blog Content: {blogContent}
Question: {userQuestion}
Provide 2-3 actionable tips to improve engagement.
";

            // --- Call Cohere Chat API ---
            var cohereClient = _httpClientFactory.CreateClient();
            cohereClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

            var payload = new
            {
                model = "command-r7b-12-2024",
                messages = new[]
                {
            new { role = "user", content = prompt }
        }
            };

            var requestContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var cohereResponse = await cohereClient.PostAsync("https://api.cohere.ai/v1/chat", requestContent);

            if (!cohereResponse.IsSuccessStatusCode)
            {
                var err = await cohereResponse.Content.ReadAsStringAsync();
                return $"Cohere API error: {cohereResponse.StatusCode}, {err}";
            }

            var result = await cohereResponse.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(result);
            if (doc.RootElement.TryGetProperty("message", out var messageElem)
                && messageElem.TryGetProperty("content", out var contentArray)
                && contentArray.GetArrayLength() > 0
                && contentArray[0].TryGetProperty("text", out var textProp))
            {
                return textProp.GetString()?.Trim() ?? "❌ AI did not return a response";
            }

            return "❌ AI did not return a response";
        }

    }
}
