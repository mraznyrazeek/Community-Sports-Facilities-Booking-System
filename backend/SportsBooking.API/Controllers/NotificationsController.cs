using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportsBooking.API.Models;

namespace SportsBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly SportsBookingDbContext _context;

        public NotificationsController(SportsBookingDbContext context)
        {
            _context = context;
        }

        // ============================================================
        // GET: api/Notifications
        // ============================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetNotifications()
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(new
                {
                    message = "Member identity could not be determined."
                });
            }

            var notifications = await _context.Notifications
                .Where(n => n.MemberId == memberId.Value)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new
                {
                    notificationId = n.NotificationId,
                    memberId = n.MemberId,
                    title = n.Title,
                    message = n.Message,
                    type = n.Type,
                    referenceType = n.ReferenceType,
                    referenceId = n.ReferenceId,
                    isRead = n.IsRead,
                    createdAt = n.CreatedAt
                })
                .ToListAsync();

            return Ok(notifications);
        }


        // ============================================================
        // POST: api/Notifications/sync-review-notifications
        //
        // Creates a Review Available notification when:
        //
        // 1. The booking belongs to the logged-in member.
        // 2. The booking is not cancelled.
        // 3. The booking end time has passed.
        // 4. The member has NOT already reviewed the facility.
        // 5. A Review notification has not already been created
        //    for that booking.
        // ============================================================
        [HttpPost("sync-review-notifications")]
        public async Task<IActionResult> SyncReviewNotifications()
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(new
                {
                    message = "Member identity could not be determined."
                });
            }

            var now = DateTime.Now;

            // --------------------------------------------------------
            // Get member bookings
            // --------------------------------------------------------

            var memberBookings = await _context.Bookings
                .Include(b => b.Facility)
                .Where(b =>
                    b.MemberId == memberId.Value &&
                    b.Status != "Cancelled")
                .ToListAsync();

            // --------------------------------------------------------
            // Get facilities already reviewed by this member
            //
            // Your system currently allows one review per facility.
            // --------------------------------------------------------

            var reviewedFacilityIds = await _context.Reviews
                .Where(r => r.MemberId == memberId.Value)
                .Select(r => r.FacilityId)
                .ToListAsync();

            var reviewedFacilities =
                new HashSet<decimal>(reviewedFacilityIds);

            // --------------------------------------------------------
            // Get existing review notifications.
            //
            // ReferenceId = BookingId
            // --------------------------------------------------------

            var existingReviewNotificationIds =
                await _context.Notifications
                    .Where(n =>
                        n.MemberId == memberId.Value &&
                        n.Type == "Review" &&
                        n.ReferenceType == "Review" &&
                        n.ReferenceId != null)
                    .Select(n => n.ReferenceId!.Value)
                    .ToListAsync();

            var existingNotificationBookingIds =
                new HashSet<decimal>(
                    existingReviewNotificationIds
                );

            var notificationsCreated = 0;

            // --------------------------------------------------------
            // Check every booking
            // --------------------------------------------------------

            foreach (var booking in memberBookings)
            {
                // A booking must have a facility.
                if (booking.Facility == null)
                {
                    continue;
                }

                // ----------------------------------------------------
                // Check booking end date/time
                // ----------------------------------------------------

                var bookingEndText =
                    $"{booking.BookingDate:yyyy-MM-dd} {booking.EndTime}";

                if (!DateTime.TryParse(
                        bookingEndText,
                        out var bookingEnd))
                {
                    continue;
                }

                // Booking has not finished yet.
                if (bookingEnd > now)
                {
                    continue;
                }

                // ----------------------------------------------------
                // Do not notify for a facility already reviewed.
                // ----------------------------------------------------

                if (reviewedFacilities.Contains(
                        booking.FacilityId))
                {
                    continue;
                }

                // ----------------------------------------------------
                // Do not create duplicate notification.
                // ----------------------------------------------------

                if (existingNotificationBookingIds.Contains(
                        booking.BookingId))
                {
                    continue;
                }

                // ----------------------------------------------------
                // Create notification
                // ----------------------------------------------------

                var notification = new Notification
                {
                    MemberId = booking.MemberId,

                    Title = "Review Available",

                    Message =
                        $"Your booking at \"{booking.Facility.FacilityName}\" is complete. Share your experience with a review.",

                    Type = "Review",

                    ReferenceType = "Review",

                    ReferenceId = booking.BookingId,

                    IsRead = false

                    // CreatedAt is generated by Oracle.
                };

                _context.Notifications.Add(notification);

                existingNotificationBookingIds.Add(
                    booking.BookingId
                );

                notificationsCreated++;
            }

            // --------------------------------------------------------
            // Save new notifications
            // --------------------------------------------------------

            if (notificationsCreated > 0)
            {
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = "Review notifications synchronized.",
                created = notificationsCreated
            });
        }


        // ============================================================
        // GET: api/Notifications/unread-count
        // ============================================================
        [HttpGet("unread-count")]
        public async Task<ActionResult<object>> GetUnreadCount()
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(new
                {
                    message = "Member identity could not be determined."
                });
            }

            var unreadCount = await _context.Notifications
                .CountAsync(n =>
                    n.MemberId == memberId.Value &&
                    n.IsRead == false);

            return Ok(new
            {
                count = unreadCount
            });
        }


        // ============================================================
        // PUT: api/Notifications/{id}/read
        // ============================================================
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(decimal id)
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(new
                {
                    message = "Member identity could not be determined."
                });
            }

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n =>
                    n.NotificationId == id &&
                    n.MemberId == memberId.Value);

            if (notification == null)
            {
                return NotFound(new
                {
                    message = "Notification not found."
                });
            }

            notification.IsRead = true;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Notification marked as read.",
                notificationId = notification.NotificationId,
                isRead = notification.IsRead
            });
        }


        // ============================================================
        // PUT: api/Notifications/read-all
        // ============================================================
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(new
                {
                    message = "Member identity could not be determined."
                });
            }

            var unreadNotifications = await _context.Notifications
                .Where(n =>
                    n.MemberId == memberId.Value &&
                    n.IsRead == false)
                .ToListAsync();

            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "All notifications marked as read.",
                count = unreadNotifications.Count
            });
        }


        // ============================================================
        // DELETE: api/Notifications/{id}
        // ============================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(decimal id)
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(new
                {
                    message = "Member identity could not be determined."
                });
            }

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n =>
                    n.NotificationId == id &&
                    n.MemberId == memberId.Value);

            if (notification == null)
            {
                return NotFound(new
                {
                    message = "Notification not found."
                });
            }

            _context.Notifications.Remove(notification);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Notification deleted successfully."
            });
        }


        // ============================================================
        // GET LOGGED-IN MEMBER ID
        // ============================================================
        private decimal? GetCurrentMemberId()
        {
            var memberIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier
            )?.Value;

            if (decimal.TryParse(
                    memberIdClaim,
                    out var memberId))
            {
                return memberId;
            }

            return null;
        }
    }
}