using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BlogApi.Models
{
    public class PendingPost
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid OriginalPostId { get; set; }   // reference to original Post
        public string Title { get; set; }
        public string Content { get; set; }
        public string AuthorUsername { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public PostStatus Status { get; set; } = PostStatus.PendingApproval;

        public List<PendingPostImage> Images { get; set; } = new();
    }
}
