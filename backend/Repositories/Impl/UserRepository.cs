using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using BlogApi.Data;
using BlogApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Repositories.Impl
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _db;
        public UserRepository(ApplicationDbContext db) { _db = db; }

        public async Task<ApplicationUser?> GetByIdAsync(string id)
        {
            return await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<IEnumerable<ApplicationUser>> GetPendingApprovalAsync()
        {
            return await _db.Users.Where(u => !u.IsApproved).ToListAsync();
        }

        public async Task SaveChangesAsync() => await _db.SaveChangesAsync();
    }
}
