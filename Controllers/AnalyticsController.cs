using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScaffoldAPI.Data;

namespace ScaffoldAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("data")]
        public async Task<IActionResult> GetAnalyticsData()
        {
            // Пример данных. Замените на реальную логику:
            var data = new {
                TotalCards = await _context.ScaffoldCards.CountAsync(),
                LastUpdated = DateTime.UtcNow
            };

            return Ok(data); // Возвращает JSON
        }
    }
}