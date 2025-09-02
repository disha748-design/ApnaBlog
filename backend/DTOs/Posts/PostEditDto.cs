namespace BlogApi.DTOs.Posts
{
    public class PostEditDto
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public IFormFile[] NewImages { get; set; }
        public string[] ExistingImages { get; set; }

    }
}
