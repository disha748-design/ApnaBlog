using Microsoft.AspNetCore.Mvc;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace BlogApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImageSuggestionController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public ImageSuggestionController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        [HttpGet("image-suggestions")]
        public async Task<IActionResult> GetImageSuggestions([FromQuery] string query)
        {
            if (string.IsNullOrEmpty(query))
                return BadRequest("Query cannot be empty.");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Accept-Version", "v1");
            client.DefaultRequestHeaders.Add("Authorization", $"Client-ID {_configuration["Unsplash:ApiKey"]}");

            var response = await client.GetAsync($"https://api.unsplash.com/search/photos?query={Uri.EscapeDataString(query)}&per_page=5");
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "Unsplash API failed.");

            var json = await response.Content.ReadAsStringAsync();
            return Content(json, "application/json");
        }
    }
}
