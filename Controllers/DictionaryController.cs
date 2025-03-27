using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScaffoldAPI.Data;
using ScaffoldAPI.Models;

namespace ScaffoldAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DictionaryController: ControllerBase
    {
        private readonly AppDbContext _context;

        public DictionaryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{type}")]
        public async Task<IActionResult> GetDictionary(string type)
        {
            var items = await _context.DictionaryItems
             .Where(d => d.Type == type)
             .ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> AddItem([FromBody] DictionaryItem item)
        {
            _context.DictionaryItems.Add(item);
            await _context.SaveChangesAsync();
            return Ok(item);
        }
    }
}