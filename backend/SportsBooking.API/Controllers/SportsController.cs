using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportsBooking.API.Models;

namespace SportsBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SportsController : ControllerBase
    {
        private readonly SportsBookingDbContext _context;

        public SportsController(SportsBookingDbContext context)
        {
            _context = context;
        }

        // GET: api/Sports
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sport>>> GetSports()
        {
            return await _context.Sports.ToListAsync();
        }

        // GET: api/Sports/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Sport>> GetSport(int id)
        {
            var sport = await _context.Sports
                .FirstOrDefaultAsync(s => s.SportId == id);

            if (sport == null)
            {
                return NotFound();
            }

            return sport;
        }

        [HttpPost]
        public async Task<ActionResult<Sport>> PostSport(Sport sport)
        {
            var maxId = await _context.Sports
                .Select(s => (decimal?)s.SportId)
                .MaxAsync() ?? 0;

            sport.SportId = maxId + 1;

            _context.Sports.Add(sport);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetSport),
                new { id = sport.SportId },
                sport);
        }

        // PUT: api/Sports/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSport(
            decimal id,
            Sport sport)
        {
            if (id != sport.SportId)
            {
                return BadRequest("Sport ID does not match.");
            }

            var existingSport = await _context.Sports
                .FirstOrDefaultAsync(s => s.SportId == id);

            if (existingSport == null)
            {
                return NotFound();
            }

            // Check duplicate sport name
            var duplicateName = await _context.Sports
                .AnyAsync(s =>
                    s.SportId != id &&
                    s.SportName.ToLower() == sport.SportName.ToLower());

            if (duplicateName)
            {
                return BadRequest("A sport with this name already exists.");
            }

            existingSport.SportName = sport.SportName;
            existingSport.Description = sport.Description;

            await _context.SaveChangesAsync();

            return NoContent();
        }


        // DELETE: api/Sports/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSport(decimal id)
        {
            var sport = await _context.Sports
                .FirstOrDefaultAsync(s => s.SportId == id);

            if (sport == null)
            {
                return NotFound();
            }

            // Check whether the sport is being used by facilities
            var hasFacilities = await _context.Facilities
                .AnyAsync(f => f.SportId == id);

            if (hasFacilities)
            {
                return BadRequest(
                    "This sport cannot be deleted because it is being used by a facility.");
            }

            // Check whether members are registered for this sport
            var hasMembers = await _context.MemberSports
                .AnyAsync(ms => ms.SportId == id);

            if (hasMembers)
            {
                return BadRequest(
                    "This sport cannot be deleted because members are registered for it.");
            }

            _context.Sports.Remove(sport);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}