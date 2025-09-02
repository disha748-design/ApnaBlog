using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.Collections.Generic;

namespace BlogApi.Models
{
    public enum PostStatus
    {
        Draft = 0,
        PendingApproval = 1,
        Published = 2,
        Rejected = 3
    }

    public class Post
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string AuthorId { get; set; } = null!;
        public ApplicationUser? Author { get; set; }
        public PostStatus Status { get; set; } = PostStatus.PendingApproval;

        public string? ApprovedById { get; set; }
        public ApplicationUser? ApprovedBy { get; set; }
       
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string AuthorUsername => Author?.UserName ?? "Unknown";
        public ICollection<PostImage> Images { get; set; } = new List<PostImage>();
        public ICollection<PostComment> Comments { get; set; } = new List<PostComment>();
        public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
        public ICollection<PostView> Views { get; set; } = new List<PostView>();
    }
}
