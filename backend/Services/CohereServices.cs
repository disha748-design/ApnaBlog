using Microsoft.Extensions.Configuration;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BlogApi .Services
{
    public class CohereServices
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public CohereServices(IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _httpClient = httpClientFactory.CreateClient();
            _apiKey = config["Cohere:ApiKey"];
        }

        // Optional: generate catchy title (still uses old generate endpoint)
        public async Task<JsonElement> GenerateTitleAsync(string content)
        {
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

            var response = await _httpClient.SendAsync(httpRequest);
            var result = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(result);
        }

        // Updated chat method for blog questions
        public async Task<string> ChatWithBlogAsync(string blogContent, string userQuestion)
        {
            if (string.IsNullOrWhiteSpace(userQuestion))
                return "❌ Please ask a valid question.";

            var payload = new
            {
                model = "command-r",
                messages = new[]
                {
                    new { role = "user", content = "Here is a blog: ...\nQuestion: ..." }
                }
            };

            var json = JsonSerializer.Serialize(payload);
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.cohere.ai/v1/chat")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            httpRequest.Headers.Add("Authorization", $"Bearer {_apiKey}");

            var response = await _httpClient.SendAsync(httpRequest);
            var result = await response.Content.ReadAsStringAsync();

            Console.WriteLine("Cohere raw response: " + result);

            using var doc = JsonDocument.Parse(result);
            if (doc.RootElement.TryGetProperty("text", out var textProp))
                return textProp.GetString();

            return $"Error from Cohere: {result}";
        }
    }
}