using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportsBooking.API.Models;

namespace SportsBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FacilitiesController : ControllerBase
    {
        private readonly SportsBookingDbContext _context;

        public FacilitiesController(SportsBookingDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
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

                    sport = f.Sport == null
                        ? null
                        : new
                        {
                            sportId = f.Sport.SportId,
                            sportName = f.Sport.SportName,
                            description = f.Sport.Description
                        }
                })
                .ToListAsync();

            return Ok(facilities);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
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

                    sport = f.Sport == null
                        ? null
                        : new
                        {
                            sportId = f.Sport.SportId,
                            sportName = f.Sport.SportName,
                            description = f.Sport.Description
                        }
                })
                .FirstOrDefaultAsync();

            if (facility == null)
            {
                return NotFound(new
                {
                    message = "Facility not found."
                });
            }

            return Ok(facility);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> PostFacility(
            Facility facility)
        {
            if (facility == null)
            {
                return BadRequest(new
                {
                    message = "Facility data is required."
                });
            }

            var sportExists = await _context.Sports
                .AnyAsync(s => s.SportId == facility.SportId);

            if (!sportExists)
            {
                return BadRequest(new
                {
                    message = "The specified sport does not exist."
                });
            }

            var duplicateName = await _context.Facilities
                .AnyAsync(f =>
                    f.FacilityName.ToLower() ==
                    facility.FacilityName.ToLower());

            if (duplicateName)
            {
                return Conflict(new
                {
                    message = "A facility with this name already exists."
                });
            }

            if (string.IsNullOrWhiteSpace(facility.Status))
            {
                facility.Status = "Active";
            }

            _context.Facilities.Add(facility);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict(new
                {
                    message = "The facility could not be created. The facility ID may already exist."
                });
            }

            return CreatedAtAction(
                nameof(GetFacility),
                new
                {
                    id = facility.FacilityId
                },
                new
                {
                    facilityId = facility.FacilityId,
                    sportId = facility.SportId,
                    facilityName = facility.FacilityName,
                    description = facility.Description,
                    location = facility.Location,
                    address = facility.Address,
                    openingTime = facility.OpeningTime,
                    closingTime = facility.ClosingTime,
                    status = facility.Status
                }
            );
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutFacility(
            decimal id,
            Facility facility)
        {
            if (facility == null)
            {
                return BadRequest(new
                {
                    message = "Facility data is required."
                });
            }

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
                return NotFound(new
                {
                    message = "Facility not found."
                });
            }

            var sportExists = await _context.Sports
                .AnyAsync(s => s.SportId == facility.SportId);

            if (!sportExists)
            {
                return BadRequest(new
                {
                    message = "The specified sport does not exist."
                });
            }

            var duplicateName = await _context.Facilities
                .AnyAsync(f =>
                    f.FacilityId != id &&
                    f.FacilityName.ToLower() ==
                    facility.FacilityName.ToLower());

            if (duplicateName)
            {
                return Conflict(new
                {
                    message = "Another facility already uses this name."
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

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict(new
                {
                    message = "The facility could not be updated."
                });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteFacility(decimal id)
        {
            var facility = await _context.Facilities
                .FirstOrDefaultAsync(f => f.FacilityId == id);

            if (facility == null)
            {
                return NotFound(new
                {
                    message = "Facility not found."
                });
            }

            var hasBookings = await _context.Bookings
                .AnyAsync(b => b.FacilityId == id);

            if (hasBookings)
            {
                return Conflict(new
                {
                    message = "This facility cannot be deleted because it has existing bookings. Please set the facility status to Inactive instead."
                });
            }

            _context.Facilities.Remove(facility);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict(new
                {
                    message = "This facility cannot be deleted because it is referenced by other records."
                });
            }

            return NoContent();
        }
    }
}