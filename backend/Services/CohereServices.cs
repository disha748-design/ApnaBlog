using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BlogApi.Services
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

        // Generate a catchy blog title using Chat API
        public async Task<string> GenerateTitleAsync(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return "❌ Content is empty";

            var payload = new
            {
                model = "command-r", // recommended working model
                messages = new[]
                {
                    new { role = "user", content = $"Write a short, catchy blog title for this content. Return only the title:\n\n{content}" }
                }
            };

            var json = JsonSerializer.Serialize(payload);
            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.cohere.ai/v1/chat")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            request.Headers.Add("Authorization", $"Bearer {_apiKey}");

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync();
                throw new System.Exception($"Cohere API error: {response.StatusCode}, {err}");
            }

            var result = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(result);

            if (doc.RootElement.TryGetProperty("generations", out var gens) && gens.GetArrayLength() > 0)
            {
                var text = gens[0].GetProperty("text").GetString()?.Trim();
                return text ?? "❌ AI did not return a valid title";
            }

            return "❌ AI did not return a valid title";
        }

        // Optional: chat about blog content
        public async Task<string> ChatWithBlogAsync(string blogContent, string userQuestion)
        {
            if (string.IsNullOrWhiteSpace(userQuestion))
                return "❌ Please ask a valid question.";

            var payload = new
            {
                model = "command-r",
                messages = new[]
                {
                    new { role = "user", content = $"Here is a blog:\n{blogContent}\nQuestion: {userQuestion}" }
                }
            };

            var json = JsonSerializer.Serialize(payload);
            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.cohere.ai/v1/chat")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            request.Headers.Add("Authorization", $"Bearer {_apiKey}");

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync();
                return $"Cohere API error: {response.StatusCode}, {err}";
            }

            var result = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(result);

            if (doc.RootElement.TryGetProperty("generations", out var gens) && gens.GetArrayLength() > 0)
            {
                return gens[0].GetProperty("text").GetString()?.Trim() ?? "❌ AI did not return a response";
            }

            return "❌ AI did not return a response";
        }
    }
}
