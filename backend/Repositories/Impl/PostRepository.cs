using System.Threading.Tasks;
using System;
using System.Linq;
using BlogApi.Data;
using BlogApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Repositories.Impl
{
    public class PostRepository : IPostRepository
    {
        private readonly ApplicationDbContext _db;
        public PostRepository(ApplicationDbContext db) { _db = db; }

        public IQueryable<Post> Query() => _db.Posts
            .Include(p => p.Images)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .Include(p => p.Views)
            .AsQueryable();

        public async Task<Post?> GetByIdAsync(Guid id)
        {
            return await Query().FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<Post>> GetPendingPostsAsync()
        {
            return await _db.Posts
                .Where(p => p.Status == PostStatus.PendingApproval) // ✅ use enum
                .Include(p => p.Author)
                .ToListAsync();
        }

        public async Task AddAsync(Post p)
        {
            await _db.Posts.AddAsync(p);
        }

        public void Remove(Post p) => _db.Posts.Remove(p);
        public void Update(Post p) => _db.Posts.Update(p);
        public async Task SaveAsync() => await _db.SaveChangesAsync();
    }
}
