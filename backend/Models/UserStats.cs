namespace BlogApi.Models
{
    // DTO to return user statistics
    public class UserStats
    {
        public int TotalPosts { get; set; }

        public PostSummary MostCommentedPost { get; set; }

        public PostSummary MostViewedPost { get; set; }

        public PostSummary MostLikedPost { get; set; }
    }

    // DTO to return basic post info for stats
    public class PostSummary
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public int CommentsCount { get; set; }
        public int Views { get; set; }
        public int Likes { get; set; }
    }
}
