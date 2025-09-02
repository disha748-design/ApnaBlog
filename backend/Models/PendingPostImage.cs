using System;

namespace BlogApi.Models
{
    public class PendingPostImage
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid PendingPostId { get; set; }
        public PendingPost PendingPost { get; set; } = default!;

        // image data
        public string Url { get; set; } = default!;

        // 👇 add these so you can use them like in PostImage
        public string? FileName { get; set; }
        public int SortOrder { get; set; }
    }
}
