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
    public class InquiriesController : ControllerBase
    {
        private readonly SportsBookingDbContext _context;

        public InquiriesController(SportsBookingDbContext context)
        {
            _context = context;
        }

        // GET: api/Inquiries
        // Admin can see all inquiries.
        // Normal members can see only their own inquiries.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Inquiry>>> GetInquiries()
        {
            if (User.IsInRole("Admin"))
            {
                var allInquiries = await _context.Inquiries
                    .ToListAsync();

                return Ok(allInquiries);
            }

            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(
                    "Member identity could not be determined.");
            }

            var inquiries = await _context.Inquiries
                .Where(i => i.MemberId == memberId.Value)
                .ToListAsync();

            return Ok(inquiries);
        }

        // GET: api/Inquiries/1
        // Admin can view any inquiry.
        // Normal members can view only their own inquiry.
        [HttpGet("{id}")]
        public async Task<ActionResult<Inquiry>> GetInquiry(decimal id)
        {
            Inquiry? inquiry;

            if (User.IsInRole("Admin"))
            {
                inquiry = await _context.Inquiries
                    .FirstOrDefaultAsync(i => i.InquiryId == id);
            }
            else
            {
                var memberId = GetCurrentMemberId();

                if (memberId == null)
                {
                    return Unauthorized(
                        "Member identity could not be determined.");
                }

                inquiry = await _context.Inquiries
                    .FirstOrDefaultAsync(i =>
                        i.InquiryId == id &&
                        i.MemberId == memberId.Value);
            }

            if (inquiry == null)
            {
                return NotFound(
                    "Inquiry not found.");
            }

            return Ok(inquiry);
        }

        // POST: api/Inquiries
        // Logged-in members can create inquiries.
        [HttpPost]
        public async Task<ActionResult<object>> CreateInquiry(
            CreateInquiryRequest request)
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(
                    "Member identity could not be determined.");
            }

            // Check member exists
            var member = await _context.Members
                .FirstOrDefaultAsync(m => m.MemberId == memberId.Value);

            if (member == null)
            {
                return BadRequest("Member does not exist.");
            }

            // Generate next Inquiry ID
            var lastInquiryId = await _context.Inquiries
                .Select(i => (decimal?)i.InquiryId)
                .MaxAsync() ?? 0;

            var inquiry = new Inquiry
            {
                InquiryId = lastInquiryId + 1,
                MemberId = memberId.Value,
                Name = member.Name,
                Email = member.Email,
                Subject = request.Subject,
                Message = request.Message,
                Status = "Pending",
                CreatedAt = DateTime.Now
            };

            _context.Inquiries.Add(inquiry);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetInquiry),
                new { id = inquiry.InquiryId },
                new
                {
                    inquiryId = inquiry.InquiryId,
                    memberId = inquiry.MemberId,
                    name = inquiry.Name,
                    email = inquiry.Email,
                    subject = inquiry.Subject,
                    message = inquiry.Message,
                    status = inquiry.Status,
                    createdAt = inquiry.CreatedAt
                });
        }

        // PUT: api/Inquiries/1
        // Admin can update any inquiry.
        // Normal members can update only their own inquiry.
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInquiry(
            decimal id,
            UpdateInquiryRequest request)
        {
            Inquiry? inquiry;

            if (User.IsInRole("Admin"))
            {
                inquiry = await _context.Inquiries
                    .FirstOrDefaultAsync(i => i.InquiryId == id);

                if (inquiry == null)
                {
                    return NotFound("Inquiry not found.");
                }

                // Admin can update the status as well.
                inquiry.Subject = request.Subject;
                inquiry.Message = request.Message;

                if (!string.IsNullOrWhiteSpace(request.Status))
                {
                    inquiry.Status = request.Status;
                }
            }
            else
            {
                var memberId = GetCurrentMemberId();

                if (memberId == null)
                {
                    return Unauthorized(
                        "Member identity could not be determined.");
                }

                inquiry = await _context.Inquiries
                    .FirstOrDefaultAsync(i =>
                        i.InquiryId == id &&
                        i.MemberId == memberId.Value);

                if (inquiry == null)
                {
                    return NotFound(
                        "Inquiry does not exist or does not belong to you.");
                }

                // Members can only update subject and message.
                inquiry.Subject = request.Subject;
                inquiry.Message = request.Message;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Inquiries/1
        // Admin can delete any inquiry.
        // Normal members can delete only their own inquiry.
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInquiry(decimal id)
        {
            Inquiry? inquiry;

            if (User.IsInRole("Admin"))
            {
                inquiry = await _context.Inquiries
                    .FirstOrDefaultAsync(i => i.InquiryId == id);
            }
            else
            {
                var memberId = GetCurrentMemberId();

                if (memberId == null)
                {
                    return Unauthorized(
                        "Member identity could not be determined.");
                }

                inquiry = await _context.Inquiries
                    .FirstOrDefaultAsync(i =>
                        i.InquiryId == id &&
                        i.MemberId == memberId.Value);
            }

            if (inquiry == null)
            {
                return NotFound(
                    "Inquiry not found.");
            }

            _context.Inquiries.Remove(inquiry);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Get logged-in member ID from JWT
        private decimal? GetCurrentMemberId()
        {
            var memberIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier)?.Value;

            if (decimal.TryParse(
                    memberIdClaim,
                    out var memberId))
            {
                return memberId;
            }

            return null;
        }
    }

    // Request model for creating an inquiry
    public class CreateInquiryRequest
    {
        public string Subject { get; set; } = null!;

        public string Message { get; set; } = null!;
    }

    // Request model for updating an inquiry
    public class UpdateInquiryRequest
    {
        public string Subject { get; set; } = null!;

        public string Message { get; set; } = null!;

        public string? Status { get; set; }
    }
}