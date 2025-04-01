using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScaffoldAPI.Data;
using ScaffoldAPI.Models;
using System.ComponentModel.DataAnnotations;

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

        // Создание новой карточки
        [HttpPost]
        public async Task<IActionResult> CreateCard([FromBody] ScaffoldCard card)
        {
            card.CalculateVolume();
            
            await _context.ScaffoldCards.AddAsync(card);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetCard), new { id = card.Id }, card);
        }

        // Получение всех карточек с пагинацией
        [HttpGet]

        public async Task<IActionResult> GetAllCards(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string sortField = "id",
            [FromQuery] string sortDirection = "asc")
        {
            IQueryable<ScaffoldCard> query = _context.ScaffoldCards;

            // Сортировка
            if (sortDirection.ToLower() == "asc")
                query = query.OrderBy(c => EF.Property<object>(c, sortField));
            else
                query = query.OrderByDescending(c => EF.Property<object>(c, sortField));

            // Пагинация
            var totalCount = await query.CountAsync();
            var cards = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new { items = cards, totalCount });
        }

        // Обновление карточки (полное)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCard(int id, [FromBody] ScaffoldCard card)
        {
            if (id != card.Id)
                return BadRequest();

            _context.Entry(card).State = EntityState.Modified;
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CardExists(id))
                    return NotFound();
                throw;
            }

            return NoContent();
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

        [HttpGet("{id}/{stage}")]
        public async Task<IActionResult> GetCardWithStage(int id, string stage)
        {
            var card = await _context.ScaffoldCards.FindAsync(id);
            if (card == null) return NotFound();
            
            card.currentStage = stage;
            return Ok(card);
        }

        // Обновление этапа карточки
        [HttpPost("update-stage")]
        public async Task<IActionResult> UpdateStage([FromBody] ScaffoldCard card)
        {
            var existingCard = await _context.ScaffoldCards.FindAsync(card.Id);
            if (existingCard == null)
                return NotFound();

            UpdateCardForStage(existingCard, card);

            existingCard.currentStage = card.currentStage;
            existingCard.status = card.status;

            // Обновляем поля в зависимости от этапа
            switch (card.currentStage)
            {
                case "Допуск":
                    existingCard.acceptanceRequestDate = card.acceptanceRequestDate;
                    existingCard.acceptanceDate = card.acceptanceDate;
                    break;
                case "Демонтаж":
                    existingCard.dismantlingRequestDate = card.dismantlingRequestDate;
                    existingCard.dismantlingRequestNumber = card.dismantlingRequestNumber;
                    existingCard.dismantlingDate = card.dismantlingDate;
                    break;
            }

            await _context.SaveChangesAsync();
            return Ok(existingCard);
        }
        
        private void UpdateCardForStage(ScaffoldCard existing, ScaffoldCard updated)
        {
            existing.currentStage = updated.currentStage;
            existing.status = updated.status;

            // Обновляем поля в зависимости от этапа
            switch (updated.currentStage)
            {
                case "Допуск":
                    existing.acceptanceRequestDate = updated.acceptanceRequestDate;
                    existing.acceptanceDate = updated.acceptanceDate;
                    break;
                case "Демонтаж":
                    existing.dismantlingRequestDate = updated.dismantlingRequestDate;
                    existing.dismantlingRequestNumber = updated.dismantlingRequestNumber;
                    existing.dismantlingDate = updated.dismantlingDate;
                    break;
            }
        }

        [HttpPost("submit-stage")]
        public async Task<IActionResult> SubmitStage([FromBody] ScaffoldCard card)
        {
            var existingCard = await _context.ScaffoldCards.FindAsync(card.Id);
            if (existingCard == null) return NotFound();

        
            // Обновляем данные карточки
            UpdateCardForStage(existingCard, card);

            // Переходим на следующий этап
            existingCard.MoveToNextStage();

            await _context.SaveChangesAsync();

            return Ok(existingCard);
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

        // Проверка существования карточки
        private bool CardExists(int id)
        {
            return _context.ScaffoldCards.Any(e => e.Id == id);
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