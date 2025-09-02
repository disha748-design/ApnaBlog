using System;
namespace BlogApi.DTOs.Comments
{
    public class CommentCreateDto
    {
        public string Content { get; set; } = null!;
        public Guid? ParentCommentId { get; set; }
    }
}
