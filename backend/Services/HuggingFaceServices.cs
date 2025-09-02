using BlogApi.Models;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace BlogApi.Services
{
    public class HuggingFaceServices
    {
        private readonly HttpClient _httpClient;
        private readonly HuggingFaceSetting _settings;

        public HuggingFaceServices(HttpClient httpClient, IOptions<HuggingFaceSetting> settings)
        {
            _httpClient = httpClient;
            _settings = settings.Value;

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _settings.ApiKey);
        }

        public async Task<string> SummarizeAsync(string text)
        {
            var requestContent = new { inputs = text };
            var content = new StringContent(JsonSerializer.Serialize(requestContent), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(
                $"https://api-inference.huggingface.co/models/{_settings.Model}",
                content
            );

            var result = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Hugging Face API error: {error}");
                throw new Exception($"Hugging Face API error: {error}");
            }

            try
            {
                using var jsonDoc = JsonDocument.Parse(result);

                if (jsonDoc.RootElement.ValueKind == JsonValueKind.Array &&
                    jsonDoc.RootElement.GetArrayLength() > 0 &&
                    jsonDoc.RootElement[0].TryGetProperty("summary_text", out var summaryProp))
                {
                    return summaryProp.GetString();
                }

                if (jsonDoc.RootElement.TryGetProperty("error", out var errorProp))
                {
                    throw new Exception($"Hugging Face model error: {errorProp.GetString()}");
                }

                throw new Exception("Unexpected Hugging Face API response format.");
            }
            catch (JsonException ex)
            {
                throw new Exception($"Failed to parse Hugging Face API response: {result}", ex);
            }
        }
    }
}
