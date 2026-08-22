using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportsBooking.API.Models;
using System.Security.Claims;

namespace SportsBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly SportsBookingDbContext _context;

        public BookingsController(SportsBookingDbContext context)
        {
            _context = context;
        }

        // GET: api/Bookings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Member)
                .Include(b => b.Facility)
                .Select(b => new
                {
                    bookingId = b.BookingId,
                    memberId = b.MemberId,
                    facilityId = b.FacilityId,
                    bookingDate = b.BookingDate,
                    startTime = b.StartTime,
                    endTime = b.EndTime,
                    status = b.Status,
                    createdAt = b.CreatedAt,

                    member = b.Member == null ? null : new
                    {
                        memberId = b.Member.MemberId,
                        name = b.Member.Name,
                        email = b.Member.Email
                    },

                    facility = b.Facility == null ? null : new
                    {
                        facilityId = b.Facility.FacilityId,
                        facilityName = b.Facility.FacilityName,
                        location = b.Facility.Location
                    }
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/Bookings/1
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetBooking(decimal id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Member)
                .Include(b => b.Facility)
                .Where(b => b.BookingId == id)
                .Select(b => new
                {
                    bookingId = b.BookingId,
                    memberId = b.MemberId,
                    facilityId = b.FacilityId,
                    bookingDate = b.BookingDate,
                    startTime = b.StartTime,
                    endTime = b.EndTime,
                    status = b.Status,
                    createdAt = b.CreatedAt,

                    member = b.Member == null ? null : new
                    {
                        memberId = b.Member.MemberId,
                        name = b.Member.Name,
                        email = b.Member.Email
                    },

                    facility = b.Facility == null ? null : new
                    {
                        facilityId = b.Facility.FacilityId,
                        facilityName = b.Facility.FacilityName,
                        location = b.Facility.Location
                    }
                })
                .FirstOrDefaultAsync();

            if (booking == null)
            {
                return NotFound("Booking does not exist.");
            }

            return Ok(booking);
        }

        // POST: api/Bookings
        [HttpPost]
        public async Task<ActionResult<object>> CreateBooking(
            BookingCreateRequest request)
        {
            // Get logged-in member ID from JWT
            var memberIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (memberIdClaim == null)
            {
                return Unauthorized("Member identity could not be determined.");
            }

            if (!decimal.TryParse(
                    memberIdClaim.Value,
                    out decimal memberId))
            {
                return Unauthorized("Invalid member identity.");
            }

            // Check member exists
            var memberExists = await _context.Members
                .AnyAsync(m => m.MemberId == memberId);

            if (!memberExists)
            {
                return BadRequest("Member does not exist.");
            }

            // Check facility exists
            var facilityExists = await _context.Facilities
                .AnyAsync(f => f.FacilityId == request.FacilityId);

            if (!facilityExists)
            {
                return BadRequest("Facility does not exist.");
            }

            // Validate start time
            if (!TimeSpan.TryParse(
                    request.StartTime,
                    out var requestedStart))
            {
                return BadRequest(
                    "Invalid start time. Use HH:mm format.");
            }

            // Validate end time
            if (!TimeSpan.TryParse(
                    request.EndTime,
                    out var requestedEnd))
            {
                return BadRequest(
                    "Invalid end time. Use HH:mm format.");
            }

            // End must be after start
            if (requestedEnd <= requestedStart)
            {
                return BadRequest(
                    "End time must be after start time.");
            }

            // Get existing bookings for same facility/date
            var existingBookings = await _context.Bookings
                .Where(b =>
                    b.FacilityId == request.FacilityId &&
                    b.BookingDate == request.BookingDate &&
                    b.Status != "Cancelled")
                .ToListAsync();

            // Check time overlap
            foreach (var existing in existingBookings)
            {
                if (!TimeSpan.TryParse(
                        existing.StartTime,
                        out var existingStart))
                {
                    continue;
                }

                if (!TimeSpan.TryParse(
                        existing.EndTime,
                        out var existingEnd))
                {
                    continue;
                }

                bool overlaps =
                    requestedStart < existingEnd &&
                    requestedEnd > existingStart;

                if (overlaps)
                {
                    return BadRequest(
                        "The facility is already booked during the selected time.");
                }
            }

            // Create booking
            var booking = new Booking
            {
                // IMPORTANT:
                // MemberId comes from JWT, NOT from the request
                MemberId = memberId,

                FacilityId = request.FacilityId,
                BookingDate = request.BookingDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,

                Status = string.IsNullOrWhiteSpace(request.Status)
                    ? "Confirmed"
                    : request.Status,

                CreatedAt = DateTime.Now
            };

            _context.Bookings.Add(booking);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetBooking),
                new { id = booking.BookingId },
                new
                {
                    bookingId = booking.BookingId,
                    memberId = booking.MemberId,
                    facilityId = booking.FacilityId,
                    bookingDate = booking.BookingDate,
                    startTime = booking.StartTime,
                    endTime = booking.EndTime,
                    status = booking.Status,
                    createdAt = booking.CreatedAt
                });
        }

        // PUT: api/Bookings/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBooking(
            decimal id,
            BookingUpdateRequest request)
        {
            // Get logged-in member ID from JWT
            var memberIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (memberIdClaim == null)
            {
                return Unauthorized();
            }

            if (!decimal.TryParse(
                    memberIdClaim.Value,
                    out decimal memberId))
            {
                return Unauthorized();
            }

            // Find booking owned by logged-in member
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b =>
                    b.BookingId == id &&
                    b.MemberId == memberId);

            if (booking == null)
            {
                return NotFound(
                    "Booking does not exist or does not belong to you.");
            }

            // Check facility exists
            var facilityExists = await _context.Facilities
                .AnyAsync(f => f.FacilityId == request.FacilityId);

            if (!facilityExists)
            {
                return BadRequest("Facility does not exist.");
            }

            // Validate start time
            if (!TimeSpan.TryParse(
                    request.StartTime,
                    out var requestedStart))
            {
                return BadRequest(
                    "Invalid start time. Use HH:mm format.");
            }

            // Validate end time
            if (!TimeSpan.TryParse(
                    request.EndTime,
                    out var requestedEnd))
            {
                return BadRequest(
                    "Invalid end time. Use HH:mm format.");
            }

            if (requestedEnd <= requestedStart)
            {
                return BadRequest(
                    "End time must be after start time.");
            }

            // Find other bookings for same facility/date
            var existingBookings = await _context.Bookings
                .Where(b =>
                    b.FacilityId == request.FacilityId &&
                    b.BookingDate == request.BookingDate &&
                    b.BookingId != id &&
                    b.Status != "Cancelled")
                .ToListAsync();

            // Check overlap
            foreach (var existing in existingBookings)
            {
                if (!TimeSpan.TryParse(
                        existing.StartTime,
                        out var existingStart))
                {
                    continue;
                }

                if (!TimeSpan.TryParse(
                        existing.EndTime,
                        out var existingEnd))
                {
                    continue;
                }

                bool overlaps =
                    requestedStart < existingEnd &&
                    requestedEnd > existingStart;

                if (overlaps)
                {
                    return BadRequest(
                        "The facility is already booked during the selected time.");
                }
            }

            // Update only allowed fields
            booking.FacilityId = request.FacilityId;
            booking.BookingDate = request.BookingDate;
            booking.StartTime = request.StartTime;
            booking.EndTime = request.EndTime;

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                booking.Status = request.Status;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Bookings/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(decimal id)
        {
            // Get logged-in member ID from JWT
            var memberIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (memberIdClaim == null)
            {
                return Unauthorized();
            }

            if (!decimal.TryParse(
                    memberIdClaim.Value,
                    out decimal memberId))
            {
                return Unauthorized();
            }

            // Only find booking if it belongs to logged-in member
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b =>
                    b.BookingId == id &&
                    b.MemberId == memberId);

            if (booking == null)
            {
                return NotFound(
                    "Booking does not exist or does not belong to you.");
            }

            _context.Bookings.Remove(booking);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Bookings/availability
        [HttpGet("availability")]
        public async Task<ActionResult<object>> GetAvailability(
            decimal facilityId,
            DateTime date)
        {
            var facility = await _context.Facilities
                .FirstOrDefaultAsync(f =>
                    f.FacilityId == facilityId);

            if (facility == null)
            {
                return NotFound("Facility does not exist.");
            }

            var bookings = await _context.Bookings
                .Where(b =>
                    b.FacilityId == facilityId &&
                    b.BookingDate == date.Date &&
                    b.Status != "Cancelled")
                .Select(b => new
                {
                    b.BookingId,
                    b.StartTime,
                    b.EndTime,
                    b.Status
                })
                .ToListAsync();

            return Ok(new
            {
                facilityId = facilityId,
                date = date.Date,
                bookings = bookings
            });
        }

        // GET: api/Bookings/member/my
        [HttpGet("member/my")]
        public async Task<ActionResult<IEnumerable<object>>> GetMyBookings()
        {
            var memberIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (memberIdClaim == null)
            {
                return Unauthorized();
            }

            if (!decimal.TryParse(
                    memberIdClaim.Value,
                    out decimal memberId))
            {
                return Unauthorized();
            }

            var bookings = await _context.Bookings
                .Include(b => b.Facility)
                .Where(b => b.MemberId == memberId)
                .OrderByDescending(b => b.BookingDate)
                .ThenByDescending(b => b.StartTime)
                .Select(b => new
                {
                    bookingId = b.BookingId,
                    memberId = b.MemberId,
                    facilityId = b.FacilityId,
                    bookingDate = b.BookingDate,
                    startTime = b.StartTime,
                    endTime = b.EndTime,
                    status = b.Status,
                    createdAt = b.CreatedAt,

                    facility = b.Facility == null ? null : new
                    {
                        facilityId = b.Facility.FacilityId,
                        facilityName = b.Facility.FacilityName,
                        location = b.Facility.Location,
                        status = b.Facility.Status
                    }
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/Bookings/facility/1
        [HttpGet("facility/{facilityId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetFacilityBookings(
            decimal facilityId)
        {
            var facilityExists = await _context.Facilities
                .AnyAsync(f => f.FacilityId == facilityId);

            if (!facilityExists)
            {
                return NotFound("Facility does not exist.");
            }

            var bookings = await _context.Bookings
                .Include(b => b.Member)
                .Include(b => b.Facility)
                .Where(b => b.FacilityId == facilityId)
                .OrderByDescending(b => b.BookingDate)
                .ThenBy(b => b.StartTime)
                .Select(b => new
                {
                    bookingId = b.BookingId,
                    memberId = b.MemberId,
                    facilityId = b.FacilityId,
                    bookingDate = b.BookingDate,
                    startTime = b.StartTime,
                    endTime = b.EndTime,
                    status = b.Status,
                    createdAt = b.CreatedAt,

                    member = b.Member == null ? null : new
                    {
                        memberId = b.Member.MemberId,
                        name = b.Member.Name,
                        email = b.Member.Email,
                        phone = b.Member.Phone
                    },

                    facility = b.Facility == null ? null : new
                    {
                        facilityId = b.Facility.FacilityId,
                        facilityName = b.Facility.FacilityName,
                        location = b.Facility.Location
                    }
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // PUT: api/Bookings/1/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(decimal id)
        {
            // Get logged-in member ID from JWT
            var memberIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (memberIdClaim == null)
            {
                return Unauthorized();
            }

            if (!decimal.TryParse(
                    memberIdClaim.Value,
                    out decimal memberId))
            {
                return Unauthorized();
            }

            // Only find booking if it belongs to logged-in member
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b =>
                    b.BookingId == id &&
                    b.MemberId == memberId);

            if (booking == null)
            {
                return NotFound(
                    "Booking does not exist or does not belong to you.");
            }

            if (booking.Status.Equals(
                    "Cancelled",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(
                    "This booking is already cancelled.");
            }

            booking.Status = "Cancelled";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Booking cancelled successfully.",
                bookingId = booking.BookingId,
                status = booking.Status
            });
        }
    }
}