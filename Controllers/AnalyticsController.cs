using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScaffoldAPI.Data;
using System.Globalization;

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

        [HttpGet("volume-by-projects")]
        public async Task<IActionResult> GetVolumeByProjects(
            [FromQuery] string? project,
            [FromQuery] string? status)
        {
            var query = _context.ScaffoldCards.AsQueryable();

            if (!string.IsNullOrEmpty(project))
                query = query.Where(c => c.project == project);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(c => c.status == status);

            var result = await query
                .GroupBy(c => c.project)
                .Select(g => new
                {
                    Project = g.Key,
                    Volume = g.Sum(c => c.volume)
                })
                .ToListAsync();

            return Ok(new {
                labels = result.Select(r => r.Project),
                values = result.Select(r => r.Volume)
            });
        }

        [HttpGet("status-distribution")]
        public async Task<IActionResult> GetStatusDistribution(
            [FromQuery] string? project)
        {
            var query = _context.ScaffoldCards.AsQueryable();

            if (!string.IsNullOrEmpty(project))
                query = query.Where(c => c.project == project);

            var result = await query
                .GroupBy(c => c.status)
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            return Ok(new {
                labels = result.Select(r => r.Status),
                values = result.Select(r => r.Count)
            });
        }

        [HttpGet("timeline")]
        public async Task<IActionResult> GetTimelineData(
            [FromQuery] string period = "month",
            [FromQuery] string? project = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var query = _context.ScaffoldCards.AsQueryable();

            if (!string.IsNullOrEmpty(project))
                query = query.Where(c => c.project == project);

            if (startDate.HasValue)
                query = query.Where(c => c.mountingDate >= startDate);

            if (endDate.HasValue)
                query = query.Where(c => c.mountingDate <= endDate);

            var cards = await query.ToListAsync();

            var timelineData = cards
                .GroupBy(c => GetPeriodKey(c.mountingDate, period))
                .OrderBy(g => g.Key)
                .Select(g => new
                {
                    Period = GetPeriodLabel(g.Key, period),
                    Volume = g.Sum(c => c.volume)
                })
                .ToList();

            return Ok(new {
                labels = timelineData.Select(r => r.Period),
                values = timelineData.Select(r => r.Volume)
            });
        }

        private static string GetPeriodKey(DateTime date, string period)
        {
            return period switch
            {
                "day" => date.ToString("yyyy-MM-dd"),
                "week" => $"{GetWeekNumber(date)}-{date.Year}",
                "year" => date.Year.ToString(),
                _ => $"{date.Year}-{date.Month}" // month
            };
        }

        private static int GetWeekNumber(DateTime date)
        {
            return CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
                date, 
                CalendarWeekRule.FirstDay, 
                DayOfWeek.Monday);
        }

        private static string GetPeriodLabel(string key, string period)
        {
            if (period == "day" && DateTime.TryParse(key, out var dayDate))
                return dayDate.ToString("dd.MM.yyyy");
            
            if (period == "week")
            {
                var parts = key.Split('-');
                return $"Неделя {parts[0]}, {parts[1]}";
            }

            if (period == "year")
                return key;

            // month
            var monthParts = key.Split('-');
            return $"{monthParts[1]}.{monthParts[0]}";
        }
    }
}