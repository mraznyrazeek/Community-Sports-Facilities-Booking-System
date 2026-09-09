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

        // ============================================================
        // GET: api/Bookings
        // Admin only - get all bookings.
        // ============================================================
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Member)
                .Include(b => b.Facility)
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


        // ============================================================
        // GET: api/Bookings/{id}
        // Authenticated users can view a booking.
        // ============================================================
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
                .FirstOrDefaultAsync();

            if (booking == null)
            {
                return NotFound(new
                {
                    message = "Booking does not exist."
                });
            }

            return Ok(booking);
        }


        // ============================================================
        // POST: api/Bookings
        // Members can create bookings.
        // ============================================================
        [HttpPost]
        public async Task<ActionResult<object>> CreateBooking(
            BookingCreateRequest request)
        {
            var memberIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (memberIdClaim == null)
            {
                return Unauthorized(new
                {
                    message = "Member identity could not be determined."
                });
            }

            if (!decimal.TryParse(
                    memberIdClaim.Value,
                    out decimal memberId))
            {
                return Unauthorized(new
                {
                    message = "Invalid member identity."
                });
            }

            var memberExists = await _context.Members
                .AnyAsync(m => m.MemberId == memberId);

            if (!memberExists)
            {
                return BadRequest(new
                {
                    message = "Member does not exist."
                });
            }

            var facilityExists = await _context.Facilities
                .AnyAsync(f => f.FacilityId == request.FacilityId);

            if (!facilityExists)
            {
                return BadRequest(new
                {
                    message = "Facility does not exist."
                });
            }

            if (!TimeSpan.TryParse(
                    request.StartTime,
                    out var requestedStart))
            {
                return BadRequest(new
                {
                    message = "Invalid start time. Use HH:mm format."
                });
            }

            if (!TimeSpan.TryParse(
                    request.EndTime,
                    out var requestedEnd))
            {
                return BadRequest(new
                {
                    message = "Invalid end time. Use HH:mm format."
                });
            }

            if (requestedEnd <= requestedStart)
            {
                return BadRequest(new
                {
                    message = "End time must be after start time."
                });
            }


            // ========================================================
            // Check whether the member already has an overlapping
            // booking on the same date.
            // ========================================================
            var memberBookings = await _context.Bookings
                .Include(b => b.Facility)
                .Where(b =>
                    b.MemberId == memberId &&
                    b.BookingDate == request.BookingDate &&
                    b.Status != "Cancelled")
                .ToListAsync();

            foreach (var existing in memberBookings)
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
                    return BadRequest(new
                    {
                        message =
                            $"You already have a booking at " +
                            $"{existing.Facility?.FacilityName ?? "another facility"} " +
                            $"from {existing.StartTime} to {existing.EndTime} " +
                            $"on this date. Please choose a different time."
                    });
                }
            }


            // ========================================================
            // Check whether the facility already has an overlapping
            // booking on the same date.
            // ========================================================
            var existingBookings = await _context.Bookings
                .Where(b =>
                    b.FacilityId == request.FacilityId &&
                    b.BookingDate == request.BookingDate &&
                    b.Status != "Cancelled")
                .ToListAsync();

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
                    return BadRequest(new
                    {
                        message =
                            $"The facility is already booked from " +
                            $"{existing.StartTime} to {existing.EndTime}. " +
                            $"Please choose a different time."
                    });
                }
            }


            // ========================================================
            // Create booking
            // ========================================================
            var booking = new Booking
            {
                MemberId = memberId,
                FacilityId = request.FacilityId,
                BookingDate = request.BookingDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Status = "Pending"
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


        // ============================================================
        // PUT: api/Bookings/{id}
        //
        // Members can update their own booking details.
        // Admins can update any booking.
        //
        // Members cannot directly change the booking status.
        // Status changes are handled by Admin confirmation/cancellation.
        // ============================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBooking(
            decimal id,
            BookingUpdateRequest request)
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

            var isAdmin = User.IsInRole("Admin");

            var bookingQuery = _context.Bookings
                .Where(b => b.BookingId == id);

            // Members can only update their own bookings.
            if (!isAdmin)
            {
                bookingQuery = bookingQuery
                    .Where(b => b.MemberId == memberId);
            }

            var booking = await bookingQuery
                .FirstOrDefaultAsync();

            if (booking == null)
            {
                return NotFound(new
                {
                    message =
                        "Booking does not exist or you do not have permission to modify it."
                });
            }


            // ========================================================
            // Only Admin can change booking status.
            // ========================================================
            string? oldStatus = booking.Status;

            if (!isAdmin &&
                !string.IsNullOrWhiteSpace(request.Status) &&
                !string.Equals(
                    request.Status,
                    booking.Status,
                    StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }


            // ========================================================
            // Validate facility
            // ========================================================
            var facilityExists = await _context.Facilities
                .AnyAsync(f => f.FacilityId == request.FacilityId);

            if (!facilityExists)
            {
                return BadRequest(new
                {
                    message = "Facility does not exist."
                });
            }


            // ========================================================
            // Validate start time
            // ========================================================
            if (!TimeSpan.TryParse(
                    request.StartTime,
                    out var requestedStart))
            {
                return BadRequest(new
                {
                    message = "Invalid start time. Use HH:mm format."
                });
            }


            // ========================================================
            // Validate end time
            // ========================================================
            if (!TimeSpan.TryParse(
                    request.EndTime,
                    out var requestedEnd))
            {
                return BadRequest(new
                {
                    message = "Invalid end time. Use HH:mm format."
                });
            }


            if (requestedEnd <= requestedStart)
            {
                return BadRequest(new
                {
                    message = "End time must be after start time."
                });
            }


            // ========================================================
            // Validate status if Admin supplied one.
            // ========================================================
            if (isAdmin &&
                !string.IsNullOrWhiteSpace(request.Status))
            {
                var requestedStatus = request.Status.Trim();

                if (!requestedStatus.Equals(
                        "Pending",
                        StringComparison.OrdinalIgnoreCase) &&
                    !requestedStatus.Equals(
                        "Confirmed",
                        StringComparison.OrdinalIgnoreCase) &&
                    !requestedStatus.Equals(
                        "Cancelled",
                        StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new
                    {
                        message =
                            "Invalid booking status. Use Pending, Confirmed, or Cancelled."
                    });
                }
            }


            // ========================================================
            // Check facility booking overlap.
            // ========================================================
            var existingBookings = await _context.Bookings
                .Where(b =>
                    b.FacilityId == request.FacilityId &&
                    b.BookingDate == request.BookingDate &&
                    b.BookingId != id &&
                    b.Status != "Cancelled")
                .ToListAsync();

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
                    return BadRequest(new
                    {
                        message =
                            "The facility is already booked during the selected time."
                    });
                }
            }


            // ========================================================
            // Update booking details
            // ========================================================
            booking.FacilityId = request.FacilityId;
            booking.BookingDate = request.BookingDate;
            booking.StartTime = request.StartTime;
            booking.EndTime = request.EndTime;


            // ========================================================
            // Only Admin can update status.
            // ========================================================
            if (isAdmin &&
                !string.IsNullOrWhiteSpace(request.Status))
            {
                booking.Status = request.Status.Trim();
            }


            // ========================================================
            // Create notification when Admin changes status.
            // ========================================================
            if (isAdmin &&
                !string.Equals(
                    oldStatus,
                    booking.Status,
                    StringComparison.OrdinalIgnoreCase))
            {
                if (booking.Status.Equals(
                        "Confirmed",
                        StringComparison.OrdinalIgnoreCase))
                {
                    var notification = new Notification
                    {
                        MemberId = booking.MemberId,
                        Title = "Booking Confirmed",
                        Message =
                            "Your booking has been confirmed by the administrator.",
                        Type = "Booking",
                        ReferenceType = "Booking",
                        ReferenceId = booking.BookingId,
                        IsRead = false
                    };

                    _context.Notifications.Add(notification);
                }
                else if (booking.Status.Equals(
                        "Cancelled",
                        StringComparison.OrdinalIgnoreCase))
                {
                    var notification = new Notification
                    {
                        MemberId = booking.MemberId,
                        Title = "Booking Cancelled",
                        Message =
                            "Your booking has been cancelled by the administrator.",
                        Type = "Booking",
                        ReferenceType = "Booking",
                        ReferenceId = booking.BookingId,
                        IsRead = false
                    };

                    _context.Notifications.Add(notification);
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }


        // ============================================================
        // PUT: api/Bookings/{id}/confirm
        //
        // Admin only.
        //
        // Confirms a Pending booking and creates a notification
        // for the member.
        // ============================================================
        [HttpPut("{id}/confirm")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ConfirmBooking(decimal id)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.BookingId == id);

            if (booking == null)
            {
                return NotFound(new
                {
                    message = "Booking does not exist."
                });
            }

            if (booking.Status.Equals(
                    "Cancelled",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "A cancelled booking cannot be confirmed."
                });
            }

            if (booking.Status.Equals(
                    "Confirmed",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "This booking is already confirmed."
                });
            }


            // ========================================================
            // Confirm booking
            // ========================================================
            booking.Status = "Confirmed";


            // ========================================================
            // Create notification
            // ========================================================
            var notification = new Notification
            {
                MemberId = booking.MemberId,
                Title = "Booking Confirmed",
                Message =
                    "Your booking has been confirmed by the administrator.",
                Type = "Booking",
                ReferenceType = "Booking",
                ReferenceId = booking.BookingId,
                IsRead = false
            };

            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Booking confirmed successfully.",
                bookingId = booking.BookingId,
                status = booking.Status
            });
        }


        // ============================================================
        // PUT: api/Bookings/{id}/cancel
        //
        // Members can cancel their own booking.
        // Admins can cancel any booking.
        //
        // If Admin cancels it, the member receives a notification.
        // If member cancels their own booking, no notification is sent.
        // ============================================================
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(decimal id)
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

            var isAdmin = User.IsInRole("Admin");

            var bookingQuery = _context.Bookings
                .Where(b => b.BookingId == id);

            if (!isAdmin)
            {
                bookingQuery = bookingQuery
                    .Where(b => b.MemberId == memberId);
            }

            var booking = await bookingQuery
                .FirstOrDefaultAsync();

            if (booking == null)
            {
                return NotFound(new
                {
                    message =
                        "Booking does not exist or you do not have permission to cancel it."
                });
            }

            if (booking.Status.Equals(
                    "Cancelled",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "This booking is already cancelled."
                });
            }


            // ========================================================
            // Cancel booking
            // ========================================================
            booking.Status = "Cancelled";


            // ========================================================
            // Only notify the member when an ADMIN cancels.
            // ========================================================
            if (isAdmin)
            {
                var notification = new Notification
                {
                    MemberId = booking.MemberId,
                    Title = "Booking Cancelled",
                    Message =
                        "Your booking has been cancelled by the administrator.",
                    Type = "Booking",
                    ReferenceType = "Booking",
                    ReferenceId = booking.BookingId,
                    IsRead = false
                };

                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Booking cancelled successfully.",
                bookingId = booking.BookingId,
                status = booking.Status
            });
        }


        // ============================================================
        // DELETE: api/Bookings/{id}
        //
        // Members can delete their own booking.
        // Admins can delete any booking.
        // ============================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(decimal id)
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

            var isAdmin = User.IsInRole("Admin");

            var bookingQuery = _context.Bookings
                .Where(b => b.BookingId == id);

            if (!isAdmin)
            {
                bookingQuery = bookingQuery
                    .Where(b => b.MemberId == memberId);
            }

            var booking = await bookingQuery
                .FirstOrDefaultAsync();

            if (booking == null)
            {
                return NotFound(new
                {
                    message =
                        "Booking does not exist or you do not have permission to delete it."
                });
            }

            _context.Bookings.Remove(booking);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict(new
                {
                    message =
                        "This booking cannot be permanently deleted because it is referenced by other records. Cancel the booking instead."
                });
            }

            return NoContent();
        }


        // ============================================================
        // GET: api/Bookings/availability
        //
        // Returns bookings for a facility on a particular date.
        // Used by the booking page to determine unavailable times.
        // ============================================================
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
                return NotFound(new
                {
                    message = "Facility does not exist."
                });
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
                facilityId,
                date = date.Date,
                bookings
            });
        }


        // ============================================================
        // GET: api/Bookings/member/my
        //
        // Returns bookings belonging to the currently logged-in member.
        // ============================================================
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


        // ============================================================
        // GET: api/Bookings/facility/{facilityId}
        //
        // Returns bookings belonging to a specific facility.
        // ============================================================
        [HttpGet("facility/{facilityId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetFacilityBookings(
            decimal facilityId)
        {
            var facilityExists = await _context.Facilities
                .AnyAsync(f => f.FacilityId == facilityId);

            if (!facilityExists)
            {
                return NotFound(new
                {
                    message = "Facility does not exist."
                });
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
    }
}