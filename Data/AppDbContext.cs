using Microsoft.EntityFrameworkCore;
using ScaffoldAPI.Models;

namespace ScaffoldAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        public DbSet<ScaffoldCard> ScaffoldCards => Set<ScaffoldCard>();
        public DbSet<DictionaryItem> DictionaryItems => Set<DictionaryItem>();
    }
}