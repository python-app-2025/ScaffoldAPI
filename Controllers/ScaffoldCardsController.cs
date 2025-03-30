using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScaffoldAPI.Data;
using ScaffoldAPI.Models;

namespace ScaffoldAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScaffoldCardsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ScaffoldCardsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateCard([FromBody] ScaffoldCard card)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            await _context.ScaffoldCards.AddAsync(card);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetCard), new { id = card.Id }, card);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCards()
        {
            var cards = await _context.ScaffoldCards.ToListAsync();
            return Ok(cards);
        }
        
        [HttpPost("update")]
        public IActionResult UpdateCard([FromBody] ScaffoldCard card)
        {
            // Ваша логика обновления карточки
            return Ok(new { success = true });
        }
        

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var card = await _context.ScaffoldCards.FindAsync(id);
            if (card == null) return NotFound();

            _context.ScaffoldCards.Remove(card);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        [HttpGet("projects")]
        public async Task<IActionResult> GetProjects()
        {
            var projects = await _context.ScaffoldCards
                .Select(c => c.project)
                .Distinct()
                .ToListAsync();
            
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCard(int id)
        {
            var card = await _context.ScaffoldCards.FindAsync(id);
            if (card == null) return NotFound();
            return Ok(card);
        }
    }
}