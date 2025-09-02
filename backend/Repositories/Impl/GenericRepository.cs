using System.Threading.Tasks;
using System.Linq;
using BlogApi.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace BlogApi.Repositories.Impl
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly ApplicationDbContext _db;
        protected readonly DbSet<T> _set;

        public GenericRepository(ApplicationDbContext db)
        {
            _db = db;
            _set = _db.Set<T>();
        }

        public IQueryable<T> Table => _set.AsQueryable();

        public async Task AddAsync(T entity)
        {
            await _set.AddAsync(entity);
        }

        public async Task<T?> GetByIdAsync(object id)
        {
            return await _set.FindAsync(id);
        }

        public void Remove(T entity)
        {
            _set.Remove(entity);
        }

        public void Update(T entity)
        {
            _set.Update(entity);
        }

        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }
    }
}
