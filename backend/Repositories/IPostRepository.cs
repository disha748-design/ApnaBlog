using System.Threading.Tasks;
using System;
using System.Linq;
using BlogApi.Models;

namespace BlogApi.Repositories
{
    public interface IPostRepository
    {
        IQueryable<Post> Query();
        Task<Post?> GetByIdAsync(Guid id);
        Task<List<Post>> GetPendingPostsAsync();
        Task AddAsync(Post p);
        void Update(Post p);
        void Remove(Post p);
        Task SaveAsync();
    }
}
