using System.Threading.Tasks;
using System.Collections.Generic;
using BlogApi.Models;

namespace BlogApi.Repositories
{
    public interface IUserRepository
    {
        Task<ApplicationUser?> GetByIdAsync(string id);
        Task<IEnumerable<ApplicationUser>> GetPendingApprovalAsync();
        Task SaveChangesAsync();
    }
}
