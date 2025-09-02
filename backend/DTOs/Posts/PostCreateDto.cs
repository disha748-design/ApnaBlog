namespace BlogApi.DTOs.Posts
{
    public class PostCreateDto
    {
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        // images handled in controller as IFormFile[]
    }
}
