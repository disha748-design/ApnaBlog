using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BlogApi.Services
{
    public class CohereServices
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _apiKey;

        public CohereServices(IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _httpClientFactory = httpClientFactory;
            _apiKey = config["Cohere:ApiKey"];
        }

        // ✅ Generate catchy title
        public async Task<JsonElement> GenerateTitleAsync(string content)
        {
            var client = _httpClientFactory.CreateClient();

            var payload = new
            {
                model = "xlarge",
                prompt = $"Write a catchy blog title for this content:\n\n{content}",
                max_tokens = 20,
                temperature = 0.7
            };

            var json = JsonSerializer.Serialize(payload);
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.cohere.ai/v1/generate")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            httpRequest.Headers.Add("Authorization", $"Bearer {_apiKey}");

            var response = await client.SendAsync(httpRequest);
            var result = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(result);
        }

        // ✅ Chat with blog content
        public async Task<string> ChatWithBlogAsync(string blogContent, string userQuestion)
        {
            if (string.IsNullOrWhiteSpace(userQuestion))
                return "❌ Please ask a valid question.";

            var client = _httpClientFactory.CreateClient();

            var payload = new
            {
                model = "command-r",
                messages = new[]
                {
                    new { role = "user", content = $"Here is a blog: {blogContent}\nQuestion: {userQuestion}" }
                }
            };

            var json = JsonSerializer.Serialize(payload);
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.cohere.ai/v1/chat")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            httpRequest.Headers.Add("Authorization", $"Bearer {_apiKey}");

            var response = await client.SendAsync(httpRequest);
            var result = await response.Content.ReadAsStringAsync();

            Console.WriteLine("Cohere raw response: " + result);

            using var doc = JsonDocument.Parse(result);
            if (doc.RootElement.TryGetProperty("text", out var textProp))
                return textProp.GetString();

            return $"Error from Cohere: {result}";
        }

        // ✅ Reply suggestions
        public async Task<string[]> GetReplySuggestions(string comment)
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

            var payload = new
            {
                model = "command-r-plus",
                message = $"Suggest 3 polite, short and engaging replies to this comment: \"{comment}\". Return them as a numbered list."
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await client.PostAsync("https://api.cohere.com/v1/chat", content);

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var text = doc.RootElement.GetProperty("text").GetString();

            var suggestions = text.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                                  .Select(s => s.Trim())
                                  .Where(s => s.Length > 0)
                                  .ToArray();

            return suggestions;
        }
    }
}
