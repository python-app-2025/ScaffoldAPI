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
            [FromQuery] string sortField = "Id",
            [FromQuery] string sortDirection = "asc")
        {
            // Валидация параметров
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;
            
            IQueryable<ScaffoldCard> query = _context.ScaffoldCards;

            // Сортировка
            if (!string.IsNullOrEmpty(sortField))
            {
                if (sortDirection.ToLower() == "desc")
                {
                    query = query.OrderByDescending(c => EF.Property<object>(c, sortField));
                }
                else
                {
                    query = query.OrderBy(c => EF.Property<object>(c, sortField));
                }
            }

            // Пагинация
            var totalItems = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Возвращаем результат с метаданными пагинации
            var result = new
            {
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                CurrentPage = page,
                PageSize = pageSize,
                Items = items
            };

            return Ok(result);
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
            
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            // Если это новая карточка (Id = 0), создаем ее
            if (card.Id == 0)
            {
                card.CalculateVolume();
                _context.ScaffoldCards.Add(card);
                await _context.ScaffoldCards.AddAsync(card);
                await _context.SaveChangesAsync();
                return Ok(card);
            }

            // Если карточка уже существует, обновляем ее
            var existingCard = await _context.ScaffoldCards.FindAsync(card.Id);
            if (existingCard == null) return NotFound();

            // Обновляем все поля карточки
            existingCard.lmo = card.lmo;
            existingCard.actNumber = card.actNumber;
            existingCard.requestNumber = card.requestNumber;
            existingCard.project = card.project;
            existingCard.sppElement = card.sppElement;
            existingCard.location = card.location;
            existingCard.requestDate = card.requestDate;
            existingCard.mountingDate = card.mountingDate;
            existingCard.scaffoldType = card.scaffoldType;
            existingCard.length = card.length;
            existingCard.width = card.width;
            existingCard.height = card.height;
            existingCard.workType = card.workType;
            existingCard.customer = card.customer;
            existingCard.operatingOrganization = card.operatingOrganization;
            existingCard.ownership = card.ownership;
            
            // Обновляем специфичные для этапа поля
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