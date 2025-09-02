using System;
using System.Collections.Generic;
using BlogApi.Models;

namespace BlogApi.DTOs.Posts
{
    public class PostDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string AuthorId { get; set; } = null!;
        public string? AuthorName { get; set; }
        public PostStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public IEnumerable<string>? ImageUrls { get; set; }
        public int ViewsCount { get; set; }
        public int LikesCount { get; set; }
        public int CommentsCount { get; set; }
    }
}
