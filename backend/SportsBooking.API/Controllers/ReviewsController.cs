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
    public class ReviewsController : ControllerBase
    {
        private readonly SportsBookingDbContext _context;

        public ReviewsController(SportsBookingDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<object>>> GetReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.Member)
                .Include(r => r.Facility)
                .Select(r => new
                {
                    reviewId = r.ReviewId,

                    memberId = r.MemberId,
                    memberName = r.Member.Name,

                    facilityId = r.FacilityId,
                    facilityName = r.Facility.FacilityName,

                    rating = r.Rating,
                    commentText = r.CommentText,
                    createdAt = r.CreatedAt
                })
                .OrderByDescending(r => r.createdAt)
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> GetReview(decimal id)
        {
            var review = await _context.Reviews
                .Include(r => r.Member)
                .Include(r => r.Facility)
                .Where(r => r.ReviewId == id)
                .Select(r => new
                {
                    reviewId = r.ReviewId,

                    memberId = r.MemberId,
                    memberName = r.Member.Name,

                    facilityId = r.FacilityId,
                    facilityName = r.Facility.FacilityName,

                    rating = r.Rating,
                    commentText = r.CommentText,
                    createdAt = r.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (review == null)
            {
                return NotFound(new
                {
                    message = "Review not found."
                });
            }

            return Ok(review);
        }


        [HttpPost]
        public async Task<ActionResult<object>> CreateReview(
            CreateReviewRequest request)
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(new
                {
                    message = "Member identity could not be determined."
                });
            }

            if (request.Rating < 1 || request.Rating > 5)
            {
                return BadRequest(new
                {
                    message = "Rating must be between 1 and 5."
                });
            }

            var facility = await _context.Facilities
                .FirstOrDefaultAsync(f =>
                    f.FacilityId == request.FacilityId);

            if (facility == null)
            {
                return BadRequest(new
                {
                    message = "Facility does not exist."
                });
            }

            var memberBookings = await _context.Bookings
                .Where(b =>
                    b.MemberId == memberId.Value &&
                    b.FacilityId == request.FacilityId &&
                    b.Status != "Cancelled")
                .ToListAsync();


            var now = DateTime.Now;

            var completedBookings = memberBookings
                .Where(b =>
                {
                    var bookingEndText =
                        $"{b.BookingDate:yyyy-MM-dd} {b.EndTime}";

                    return DateTime.TryParse(
                        bookingEndText,
                        out var bookingEnd) &&
                        bookingEnd <= now;
                })
                .ToList();


            if (!completedBookings.Any())
            {
                return BadRequest(new
                {
                    message =
                        "You can only review a facility after completing a booking there."
                });
            }

            var alreadyReviewed = await _context.Reviews
                .AnyAsync(r =>
                    r.MemberId == memberId.Value &&
                    r.FacilityId == request.FacilityId);

            if (alreadyReviewed)
            {
                return BadRequest(new
                {
                    message =
                        "You have already reviewed this facility."
                });
            }

            var comment = request.CommentText?.Trim();

            if (!string.IsNullOrWhiteSpace(comment) &&
                comment.Length > 500)
            {
                return BadRequest(new
                {
                    message =
                        "Comment cannot be longer than 500 characters."
                });
            }

            var review = new Review
            {
                MemberId = memberId.Value,
                FacilityId = request.FacilityId,
                Rating = request.Rating,
                CommentText = comment
            };

            _context.Reviews.Add(review);

            await _context.SaveChangesAsync();

            var completedBookingIds = completedBookings
                .Select(b => b.BookingId)
                .ToHashSet();


            if (completedBookingIds.Count > 0)
            {
                var reviewNotifications =
                    await _context.Notifications
                        .Where(n =>
                            n.MemberId == memberId.Value &&
                            n.Type == "Review" &&
                            n.ReferenceType == "Review" &&
                            n.ReferenceId != null)
                        .ToListAsync();


                var notificationsToRemove =
                    reviewNotifications
                        .Where(n =>
                            n.ReferenceId.HasValue &&
                            completedBookingIds.Contains(
                                n.ReferenceId.Value))
                        .ToList();


                if (notificationsToRemove.Any())
                {
                    _context.Notifications.RemoveRange(
                        notificationsToRemove);

                    await _context.SaveChangesAsync();
                }
            }


            return CreatedAtAction(
                nameof(GetReview),
                new
                {
                    id = review.ReviewId
                },
                new
                {
                    reviewId = review.ReviewId,

                    memberId = review.MemberId,
                    memberName = facility.FacilityName,

                    facilityId = review.FacilityId,
                    facilityName = facility.FacilityName,

                    rating = review.Rating,
                    commentText = review.CommentText,
                    createdAt = review.CreatedAt
                }
            );
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(
            decimal id,
            UpdateReviewRequest request)
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(new
                {
                    message = "Member identity could not be determined."
                });
            }


            if (request.Rating < 1 || request.Rating > 5)
            {
                return BadRequest(new
                {
                    message = "Rating must be between 1 and 5."
                });
            }


            var review = await _context.Reviews
                .FirstOrDefaultAsync(r =>
                    r.ReviewId == id);

            if (review == null)
            {
                return NotFound(new
                {
                    message = "Review not found."
                });
            }


            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin &&
                review.MemberId != memberId.Value)
            {
                return Forbid();
            }


            var comment = request.CommentText?.Trim();

            if (!string.IsNullOrWhiteSpace(comment) &&
                comment.Length > 500)
            {
                return BadRequest(new
                {
                    message =
                        "Comment cannot be longer than 500 characters."
                });
            }


            review.Rating = request.Rating;
            review.CommentText = comment;

            // CreatedAt remains unchanged.

            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(
            decimal id)
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(new
                {
                    message = "Member identity could not be determined."
                });
            }


            var review = await _context.Reviews
                .FirstOrDefaultAsync(r =>
                    r.ReviewId == id);

            if (review == null)
            {
                return NotFound(new
                {
                    message = "Review not found."
                });
            }


            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin &&
                review.MemberId != memberId.Value)
            {
                return Forbid();
            }


            _context.Reviews.Remove(review);

            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpGet("facility/{facilityId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<object>>>
            GetFacilityReviews(decimal facilityId)
        {
            var facilityExists = await _context.Facilities
                .AnyAsync(f =>
                    f.FacilityId == facilityId);

            if (!facilityExists)
            {
                return NotFound(new
                {
                    message = "Facility does not exist."
                });
            }


            var reviews = await _context.Reviews
                .Include(r => r.Member)
                .Where(r =>
                    r.FacilityId == facilityId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    reviewId = r.ReviewId,

                    memberId = r.MemberId,
                    memberName = r.Member.Name,

                    facilityId = r.FacilityId,

                    rating = r.Rating,
                    commentText = r.CommentText,
                    createdAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }


        [HttpGet("member/my")]
        public async Task<ActionResult<IEnumerable<object>>>
            GetMyReviews()
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(new
                {
                    message = "Member identity could not be determined."
                });
            }


            var reviews = await _context.Reviews
                .Include(r => r.Facility)
                .Where(r =>
                    r.MemberId == memberId.Value)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    reviewId = r.ReviewId,

                    facilityId = r.FacilityId,
                    facilityName = r.Facility.FacilityName,

                    rating = r.Rating,
                    commentText = r.CommentText,
                    createdAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }


        [HttpGet("member/reviewable")]
        public async Task<ActionResult<IEnumerable<object>>>
            GetReviewableBookings()
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

            var memberBookings = await _context.Bookings
                .Include(b => b.Facility)
                .Where(b =>
                    b.MemberId == memberId.Value &&
                    b.Status != "Cancelled")
                .OrderByDescending(b => b.BookingDate)
                .ThenByDescending(b => b.StartTime)
                .ToListAsync();


            var reviewableBookings = memberBookings
                .Where(b =>
                {
                    var bookingEndText =
                        $"{b.BookingDate:yyyy-MM-dd} {b.EndTime}";

                    return DateTime.TryParse(
                        bookingEndText,
                        out var bookingEnd) &&
                        bookingEnd <= now;
                })
                .Select(b => new
                {
                    bookingId = b.BookingId,

                    facilityId = b.FacilityId,
                    facilityName = b.Facility.FacilityName,
                    location = b.Facility.Location,

                    bookingDate = b.BookingDate,
                    startTime = b.StartTime,
                    endTime = b.EndTime,

                    bookingStatus = b.Status,


                    review = _context.Reviews
                        .Where(r =>
                            r.MemberId == memberId.Value &&
                            r.FacilityId == b.FacilityId)
                        .Select(r => new
                        {
                            reviewId = r.ReviewId,

                            rating = r.Rating,
                            commentText = r.CommentText,
                            createdAt = r.CreatedAt
                        })
                        .FirstOrDefault()
                })
                .ToList();


            return Ok(reviewableBookings);
        }


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

        public class CreateReviewRequest
        {
            public decimal FacilityId { get; set; }

            public decimal Rating { get; set; }

            public string? CommentText { get; set; }
        }


        public class UpdateReviewRequest
        {
            public decimal Rating { get; set; }

            public string? CommentText { get; set; }
        }
    }
}