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
    public class InquiryResponsesController : ControllerBase
    {
        private readonly SportsBookingDbContext _context;

        public InquiryResponsesController(
            SportsBookingDbContext context)
        {
            _context = context;
        }

        // GET: api/InquiryResponses/inquiry/1
        // Get all responses for an inquiry
        [HttpGet("inquiry/{inquiryId}")]
        public async Task<ActionResult<IEnumerable<InquiryResponse>>>
            GetInquiryResponses(decimal inquiryId)
        {
            var inquiry = await _context.Inquiries
                .FirstOrDefaultAsync(i => i.InquiryId == inquiryId);

            if (inquiry == null)
            {
                return NotFound(new
                {
                    message = "Inquiry not found."
                });
            }

            // Admin can view any inquiry
            if (!User.IsInRole("Admin"))
            {
                var memberId = GetCurrentMemberId();

                if (memberId == null)
                {
                    return Unauthorized(
                        "Member identity could not be determined.");
                }

                // Member can only view their own inquiry
                if (inquiry.MemberId != memberId.Value)
                {
                    return Forbid();
                }
            }

            var responses = await _context.InquiryResponses
                .Where(r => r.InquiryId == inquiryId)
                .OrderBy(r => r.CreatedAt)
                .ToListAsync();

            return Ok(responses);
        }

        // GET: api/InquiryResponses/1
        // Get one response
        [HttpGet("{id}")]
        public async Task<ActionResult<InquiryResponse>>
            GetInquiryResponse(decimal id)
        {
            var response = await _context.InquiryResponses
                .Include(r => r.Inquiry)
                .FirstOrDefaultAsync(r => r.ResponseId == id);

            if (response == null)
            {
                return NotFound(new
                {
                    message = "Response not found."
                });
            }

            // Admin can view any response
            if (!User.IsInRole("Admin"))
            {
                var memberId = GetCurrentMemberId();

                if (memberId == null)
                {
                    return Unauthorized(
                        "Member identity could not be determined.");
                }

                if (response.Inquiry.MemberId != memberId.Value)
                {
                    return Forbid();
                }
            }

            return Ok(response);
        }

        // POST: api/InquiryResponses/inquiry/1
        // Admin or member can send a response.
        // SenderRole is determined automatically from JWT.
        [HttpPost("inquiry/{inquiryId}")]
        public async Task<ActionResult<object>> CreateInquiryResponse(
            decimal inquiryId,
            CreateInquiryResponseRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new
                {
                    message = "Response message cannot be empty."
                });
            }

            var inquiry = await _context.Inquiries
                .FirstOrDefaultAsync(i => i.InquiryId == inquiryId);

            if (inquiry == null)
            {
                return NotFound(new
                {
                    message = "Inquiry not found."
                });
            }

            string senderRole;

            if (User.IsInRole("Admin"))
            {
                senderRole = "Admin";

                // If admin replies to a Pending inquiry,
                // automatically move it to In Progress.
                if (inquiry.Status == "Pending")
                {
                    inquiry.Status = "In Progress";
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

                // Member can only reply to their own inquiry.
                if (inquiry.MemberId != memberId.Value)
                {
                    return Forbid();
                }

                senderRole = "Member";

                // If a member replies after an inquiry was resolved,
                // move it back to Pending.
                if (inquiry.Status == "Resolved")
                {
                    inquiry.Status = "Pending";
                }
            }

            var response = new InquiryResponse
            {
                InquiryId = inquiry.InquiryId,
                SenderRole = senderRole,
                Message = request.Message
            };

            _context.InquiryResponses.Add(response);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetInquiryResponse),
                new
                {
                    id = response.ResponseId
                },
                new
                {
                    responseId = response.ResponseId,
                    inquiryId = response.InquiryId,
                    senderRole = response.SenderRole,
                    message = response.Message,
                    createdAt = response.CreatedAt
                });
        }


        // DELETE: api/InquiryResponses/1
        // Admin can delete any response.
        // Members can delete only their own responses.
        [HttpDelete("{id}")]
        public async Task<IActionResult>
            DeleteInquiryResponse(decimal id)
        {
            var response = await _context.InquiryResponses
                .Include(r => r.Inquiry)
                .FirstOrDefaultAsync(r => r.ResponseId == id);

            if (response == null)
            {
                return NotFound(new
                {
                    message = "Response not found."
                });
            }

            if (!User.IsInRole("Admin"))
            {
                var memberId = GetCurrentMemberId();

                if (memberId == null)
                {
                    return Unauthorized(
                        "Member identity could not be determined.");
                }

                if (response.Inquiry.MemberId != memberId.Value)
                {
                    return Forbid();
                }

                // Member can only delete their own messages
                if (response.SenderRole != "Member")
                {
                    return Forbid();
                }
            }

            _context.InquiryResponses.Remove(response);

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

    // Request model
    public class CreateInquiryResponseRequest
    {
        public decimal InquiryId { get; set; }

        public string Message { get; set; } = null!;
    }
}