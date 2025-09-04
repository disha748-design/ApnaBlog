using BlogApi.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> opts) : base(opts) { }

        // DbSets
        public DbSet<Post> Posts => Set<Post>();
        public DbSet<PostImage> PostImages => Set<PostImage>();
        public DbSet<PostView> PostViews => Set<PostView>();
        public DbSet<PostLike> PostLikes => Set<PostLike>();
        public DbSet<PostComment> PostComments => Set<PostComment>();
        //public DbSet<PendingPost> PendingPosts { get; set; }
        public DbSet<PendingPost> PendingPosts { get; set; }
        public DbSet<PendingPostImage> PendingPostImages { get; set; }

        public DbSet<UserProfile> UserProfiles => Set<UserProfile>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // -----------------------------
            // Post → Images
            // Cascade delete images when post is deleted
            // -----------------------------
            builder.Entity<Post>()
                .HasMany(p => p.Images)
                .WithOne(i => i.Post)
                .HasForeignKey(i => i.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------
            // Post → Comments
            // Cascade delete comments when post is deleted
            // -----------------------------
            builder.Entity<Post>()
                .HasMany(p => p.Comments)
                .WithOne(c => c.Post)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------
            // PostLike → Unique constraint: (PostId + UserId)
            // -----------------------------
            builder.Entity<PostLike>()
                .HasIndex(pl => new { pl.PostId, pl.UserId })
                .IsUnique();

            // PostLike → Post
            // Cascade delete likes when post is deleted
            builder.Entity<PostLike>()
                .HasOne(pl => pl.Post)
                .WithMany(p => p.Likes)
                .HasForeignKey(pl => pl.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // PostLike → User
            // Restrict deleting a user if they have liked posts
            builder.Entity<PostLike>()
                .HasOne(pl => pl.User)
                .WithMany()
                .HasForeignKey(pl => pl.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // -----------------------------
            // PostView → Track by Post + User
            // -----------------------------
            builder.Entity<PostView>()
                .HasIndex(pv => new { pv.PostId, pv.UserId });

            // PostView → Post
            // Restrict to avoid multiple cascade paths
            builder.Entity<PostView>()
                .HasOne(pv => pv.Post)
                .WithMany(p => p.Views)
                .HasForeignKey(pv => pv.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // PostView → User
            builder.Entity<PostView>()
                .HasOne(pv => pv.User)
                .WithMany()
                .HasForeignKey(pv => pv.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // -----------------------------
            // PostComment → Author (User)
            // Restrict deleting user if they have comments
            // -----------------------------
            builder.Entity<PostComment>()
                .HasOne(c => c.Author)
                .WithMany()
                .HasForeignKey(c => c.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
