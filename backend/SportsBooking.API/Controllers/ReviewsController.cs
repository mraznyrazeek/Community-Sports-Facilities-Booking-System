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

        // GET: api/Reviews
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviews()
        {
            return await _context.Reviews
                .ToListAsync();
        }

        // GET: api/Reviews/1
        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> GetReview(decimal id)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.ReviewId == id);

            if (review == null)
            {
                return NotFound();
            }

            return Ok(review);
        }

        // POST: api/Reviews
        [HttpPost]
        public async Task<ActionResult<Review>> CreateReview(
            CreateReviewRequest request)
        {
            // Get logged-in member ID from JWT
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(
                    "Member identity could not be determined.");
            }

            // Check facility exists
            var facilityExists = await _context.Facilities
                .AnyAsync(f => f.FacilityId == request.FacilityId);

            if (!facilityExists)
            {
                return BadRequest("Facility does not exist.");
            }

            // Create review using logged-in member
            var review = new Review
            {
                MemberId = memberId.Value,
                FacilityId = request.FacilityId,
                Rating = request.Rating,
                CommentText = request.CommentText,
                CreatedAt = DateTime.Now
            };

            _context.Reviews.Add(review);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetReview),
                new { id = review.ReviewId },
                review);
        }

        // PUT: api/Reviews/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(
            decimal id,
            UpdateReviewRequest request)
        {
            // Get logged-in member ID from JWT
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(
                    "Member identity could not be determined.");
            }

            // Find review belonging to logged-in member
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r =>
                    r.ReviewId == id &&
                    r.MemberId == memberId.Value);

            if (review == null)
            {
                return NotFound(
                    "Review does not exist or does not belong to you.");
            }

            // Only update allowed fields
            review.Rating = request.Rating;
            review.CommentText = request.CommentText;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Reviews/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(decimal id)
        {
            // Get logged-in member ID from JWT
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(
                    "Member identity could not be determined.");
            }

            // Find review belonging to logged-in member
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r =>
                    r.ReviewId == id &&
                    r.MemberId == memberId.Value);

            if (review == null)
            {
                return NotFound(
                    "Review does not exist or does not belong to you.");
            }

            _context.Reviews.Remove(review);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Get logged-in member ID from JWT
        private decimal? GetCurrentMemberId()
        {
            var memberIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier)?.Value;

            if (decimal.TryParse(memberIdClaim, out var memberId))
            {
                return memberId;
            }

            return null;
        }
    }

    // Request model for creating a review
    public class CreateReviewRequest
    {
        public decimal FacilityId { get; set; }

        public decimal Rating { get; set; }

        public string? CommentText { get; set; }
    }

    // Request model for updating a review
    public class UpdateReviewRequest
    {
        public decimal Rating { get; set; }

        public string? CommentText { get; set; }
    }
}