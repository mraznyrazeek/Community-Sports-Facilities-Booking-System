using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportsBooking.API.Models;

namespace SportsBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FacilitiesController : ControllerBase
    {
        private readonly SportsBookingDbContext _context;

        public FacilitiesController(SportsBookingDbContext context)
        {
            _context = context;
        }

        // GET: api/Facilities
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetFacilities()
        {
            var facilities = await _context.Facilities
                .Select(f => new
                {
                    facilityId = f.FacilityId,
                    sportId = f.SportId,
                    facilityName = f.FacilityName,
                    description = f.Description,
                    location = f.Location,
                    address = f.Address,
                    openingTime = f.OpeningTime,
                    closingTime = f.ClosingTime,
                    status = f.Status,

                    sport = f.Sport == null ? null : new
                    {
                        sportId = f.Sport.SportId,
                        sportName = f.Sport.SportName,
                        description = f.Sport.Description
                    }
                })
                .ToListAsync();

            return Ok(facilities);
        }

        // GET: api/Facilities/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetFacility(decimal id)
        {
            var facility = await _context.Facilities
                .Where(f => f.FacilityId == id)
                .Select(f => new
                {
                    facilityId = f.FacilityId,
                    sportId = f.SportId,
                    facilityName = f.FacilityName,
                    description = f.Description,
                    location = f.Location,
                    address = f.Address,
                    openingTime = f.OpeningTime,
                    closingTime = f.ClosingTime,
                    status = f.Status,

                    sport = f.Sport == null ? null : new
                    {
                        sportId = f.Sport.SportId,
                        sportName = f.Sport.SportName,
                        description = f.Sport.Description
                    }
                })
                .FirstOrDefaultAsync();

            if (facility == null)
            {
                return NotFound();
            }

            return Ok(facility);
        }

        // POST: api/Facilities
        [HttpPost]
        public async Task<ActionResult<Facility>> PostFacility(Facility facility)
        {
            // Make sure the referenced sport exists
            var sportExists = await _context.Sports
                .AnyAsync(s => s.SportId == facility.SportId);

            if (!sportExists)
            {
                return BadRequest(new
                {
                    message = "The specified sport does not exist."
                });
            }

            _context.Facilities.Add(facility);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetFacility),
                new { id = facility.FacilityId },
                facility
            );
        }

        // PUT: api/Facilities/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFacility(
            decimal id,
            Facility facility)
        {
            if (id != facility.FacilityId)
            {
                return BadRequest(new
                {
                    message = "Facility ID in the URL does not match the Facility ID in the request body."
                });
            }

            var existingFacility = await _context.Facilities
                .FirstOrDefaultAsync(f => f.FacilityId == id);

            if (existingFacility == null)
            {
                return NotFound();
            }

            // Make sure the referenced sport exists
            var sportExists = await _context.Sports
                .AnyAsync(s => s.SportId == facility.SportId);

            if (!sportExists)
            {
                return BadRequest(new
                {
                    message = "The specified sport does not exist."
                });
            }

            existingFacility.SportId = facility.SportId;
            existingFacility.FacilityName = facility.FacilityName;
            existingFacility.Description = facility.Description;
            existingFacility.Location = facility.Location;
            existingFacility.Address = facility.Address;
            existingFacility.OpeningTime = facility.OpeningTime;
            existingFacility.ClosingTime = facility.ClosingTime;
            existingFacility.Status = facility.Status;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Facilities/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFacility(decimal id)
        {
            var facility = await _context.Facilities
                .FirstOrDefaultAsync(f => f.FacilityId == id);

            if (facility == null)
            {
                return NotFound();
            }

            _context.Facilities.Remove(facility);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}