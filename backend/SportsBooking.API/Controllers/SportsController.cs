using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportsBooking.API.Models;

namespace SportsBooking.API.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class SportsController : ControllerBase
    {
        private readonly SportsBookingDbContext _context;

        public SportsController(SportsBookingDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Sport>>> GetSports()
        {
            return await _context.Sports.ToListAsync();
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Sport>> GetSport(decimal id)
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
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Sport>> PostSport(Sport sport)
        {
            _context.Sports.Add(sport);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetSport),
                new { id = sport.SportId },
                sport);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
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

            var duplicateName = await _context.Sports
                .AnyAsync(s =>
                    s.SportId != id &&
                    s.SportName.ToLower() == sport.SportName.ToLower());

            if (duplicateName)
            {
                return BadRequest(
                    "A sport with this name already exists.");
            }

            existingSport.SportName = sport.SportName;
            existingSport.Description = sport.Description;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSport(decimal id)
        {
            var sport = await _context.Sports
                .FirstOrDefaultAsync(s => s.SportId == id);

            if (sport == null)
            {
                return NotFound();
            }

            var hasFacilities = await _context.Facilities
                .AnyAsync(f => f.SportId == id);

            if (hasFacilities)
            {
                return BadRequest(
                    "This sport cannot be deleted because it is being used by a facility.");
            }

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