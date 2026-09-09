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


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Inquiry>>> GetInquiries()
        {
            if (User.IsInRole("Admin"))
            {
                var allInquiries = await _context.Inquiries
                    .Include(i => i.Responses)
                    .OrderByDescending(i => i.CreatedAt)
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
                .Include(i => i.Responses)
                .Where(i => i.MemberId == memberId.Value)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(inquiries);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Inquiry>> GetInquiry(decimal id)
        {
            Inquiry? inquiry;

            if (User.IsInRole("Admin"))
            {
                inquiry = await _context.Inquiries
                    .Include(i => i.Responses)
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
                    .Include(i => i.Responses)
                    .FirstOrDefaultAsync(i =>
                        i.InquiryId == id &&
                        i.MemberId == memberId.Value);
            }

            if (inquiry == null)
            {
                return NotFound("Inquiry not found.");
            }

            return Ok(inquiry);
        }


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

            if (string.IsNullOrWhiteSpace(request.Subject))
            {
                return BadRequest("Subject cannot be empty.");
            }

            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message cannot be empty.");
            }

            var member = await _context.Members
                .FirstOrDefaultAsync(m => m.MemberId == memberId.Value);

            if (member == null)
            {
                return BadRequest("Member does not exist.");
            }

            var inquiry = new Inquiry
            {
                MemberId = memberId.Value,
                Name = member.Name,
                Email = member.Email,
                Subject = request.Subject.Trim(),
                Message = request.Message.Trim(),
                Status = "Pending"

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

                // Keep the old status so we know if it changed.
                var oldStatus = inquiry.Status;

                if (!string.IsNullOrWhiteSpace(request.Subject))
                {
                    inquiry.Subject = request.Subject.Trim();
                }

                if (!string.IsNullOrWhiteSpace(request.Message))
                {
                    inquiry.Message = request.Message.Trim();
                }

                if (!string.IsNullOrWhiteSpace(request.Status))
                {
                    inquiry.Status = request.Status.Trim();
                }

                if (!string.Equals(
                        oldStatus,
                        inquiry.Status,
                        StringComparison.OrdinalIgnoreCase))
                {
                    if (inquiry.Status.Equals(
                            "In Progress",
                            StringComparison.OrdinalIgnoreCase))
                    {
                        CreateInquiryNotification(
                            inquiry,
                            "Inquiry In Progress",
                            $"Your inquiry \"{inquiry.Subject}\" is now in progress.");
                    }
                    else if (inquiry.Status.Equals(
                             "Resolved",
                             StringComparison.OrdinalIgnoreCase))
                    {
                        CreateInquiryNotification(
                            inquiry,
                            "Inquiry Resolved",
                            $"Your inquiry \"{inquiry.Subject}\" has been resolved.");
                    }
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
                if (!string.IsNullOrWhiteSpace(request.Subject))
                {
                    inquiry.Subject = request.Subject.Trim();
                }

                if (!string.IsNullOrWhiteSpace(request.Message))
                {
                    inquiry.Message = request.Message.Trim();
                }
            }


            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/Responses/Member")]
        public async Task<ActionResult<InquiryResponse>> AddMemberResponse(
        decimal id,
        CreateInquiryResponseRequest request)
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized(
                    "Member identity could not be determined.");
            }

            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message cannot be empty.");
            }

            var inquiry = await _context.Inquiries
                .FirstOrDefaultAsync(i =>
                    i.InquiryId == id &&
                    i.MemberId == memberId.Value);

            if (inquiry == null)
            {
                return NotFound(
                    "Inquiry not found or does not belong to you.");
            }

            if (inquiry.Status.Equals(
                    "Resolved",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(
                    "This inquiry has been resolved and cannot receive new replies.");
            }

            var response = new InquiryResponse
            {
                InquiryId = inquiry.InquiryId,
                SenderRole = "Member",
                Message = request.Message.Trim()
                // CreatedAt is generated automatically by Oracle.
            };

            _context.InquiryResponses.Add(response);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetInquiry),
                new { id = inquiry.InquiryId },
                response);
        }


        [HttpPost("{id}/Responses/Admin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<InquiryResponse>> AddAdminResponse(
            decimal id,
            CreateInquiryResponseRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message cannot be empty.");
            }

            var inquiry = await _context.Inquiries
                .FirstOrDefaultAsync(i => i.InquiryId == id);

            if (inquiry == null)
            {
                return NotFound("Inquiry not found.");
            }

            var response = new InquiryResponse
            {
                InquiryId = inquiry.InquiryId,
                SenderRole = "Admin",
                Message = request.Message.Trim()
                // CreatedAt is generated by Oracle.
            };

            _context.InquiryResponses.Add(response);

            inquiry.AdminResponse = request.Message.Trim();
            inquiry.RespondedAt = DateTime.UtcNow;


            CreateInquiryNotification(
                inquiry,
                "New Inquiry Response",
                $"You have received a new response to your inquiry \"{inquiry.Subject}\".");

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetInquiry),
                new { id = inquiry.InquiryId },
                response);
        }

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
                return NotFound("Inquiry not found.");
            }

            _context.Inquiries.Remove(inquiry);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private void CreateInquiryNotification(
            Inquiry inquiry,
            string title,
            string message)
        {
            var notification = new Notification
            {
                MemberId = inquiry.MemberId,
                Title = title,
                Message = message,
                Type = "Inquiry",
                ReferenceType = "Inquiry",
                ReferenceId = inquiry.InquiryId,
                IsRead = false
                // CreatedAt is generated automatically by Oracle.
            };

            _context.Notifications.Add(notification);
        }

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


    public class CreateInquiryRequest
    {
        public string Subject { get; set; } = null!;

        public string Message { get; set; } = null!;
    }


    public class UpdateInquiryRequest
    {
        public string Subject { get; set; } = null!;

        public string Message { get; set; } = null!;

        public string? Status { get; set; }
    }
}