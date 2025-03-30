using Microsoft.EntityFrameworkCore;
using ScaffoldAPI.Models;

namespace ScaffoldAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        public DbSet<ScaffoldCard> ScaffoldCards => Set<ScaffoldCard>();
        public DbSet<DictionaryItem> DictionaryItems => Set<DictionaryItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ScaffoldCard>()
                .HasIndex(c => new { c.project, c.status, c.mountingDate });
            
            modelBuilder.Entity<ScaffoldCard>()
                .Property(c => c.volume)
                .HasComputedColumnSql("[length]*[width]*[height]");
        }
    }
}