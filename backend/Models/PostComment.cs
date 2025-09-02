using System;
namespace BlogApi.Models
{
    public class PostComment
    {
        public Guid Id { get; set; }
        public Guid PostId { get; set; }
        public Post? Post { get; set; }
        public string AuthorId { get; set; } = null!;
        public ApplicationUser? Author { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public Guid? ParentCommentId { get; set; }
    }
}
