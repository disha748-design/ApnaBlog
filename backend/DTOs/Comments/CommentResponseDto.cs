using System;

namespace BlogApi.DTOs.Comments
{
    public class CommentResponseDto
    {
        public Guid Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public string AuthorId { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;

        public Guid? ParentCommentId { get; set; }
    }
}
