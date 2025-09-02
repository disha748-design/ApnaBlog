using System;
namespace BlogApi.Models
{
    public class PostView
    {
        public Guid Id { get; set; }
        public Guid PostId { get; set; }
        public Post? Post { get; set; }
        public string? UserId { get; set; } // optional
        public ApplicationUser? User { get; set; }   // ✅ Add this
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
        public string? IpAddress { get; set; } // optional
    }
}
