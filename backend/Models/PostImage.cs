using System;
namespace BlogApi.Models
{
    public class PostImage
    {
        public Guid Id { get; set; }
        public Guid PostId { get; set; }
        public Post? Post { get; set; }
        public string FileName { get; set; } = null!; // saved file name
        public string Url { get; set; } = null!; // e.g., /Uploads/filename.jpg
        public int SortOrder { get; set; } = 0;
    }
}
