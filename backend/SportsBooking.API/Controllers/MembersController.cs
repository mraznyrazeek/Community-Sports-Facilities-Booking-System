using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportsBooking.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace SportsBooking.API.Controllers
{
    // DTO used specifically when updating a member
    public class UpdateMemberRequest
    {
        public decimal MemberId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string Status { get; set; } = "Active";

        public string? UserRole { get; set; }

        // Password is OPTIONAL when editing
        public string? Password { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class MembersController : ControllerBase
    {
        private readonly SportsBookingDbContext _context;

        public MembersController(SportsBookingDbContext context)
        {
            _context = context;
        }

        // GET: api/Members
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetMembers()
        {
            var members = await _context.Members
                .Select(m => new
                {
                    memberId = m.MemberId,
                    name = m.Name,
                    email = m.Email,
                    phone = m.Phone,
                    status = m.Status,
                    role = m.UserRole,
                    createdAt = m.CreatedAt
                })
                .ToListAsync();

            return Ok(members);
        }

        // GET: api/Members/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetMember(decimal id)
        {
            var member = await _context.Members
                .Where(m => m.MemberId == id)
                .Select(m => new
                {
                    memberId = m.MemberId,
                    name = m.Name,
                    email = m.Email,
                    phone = m.Phone,
                    status = m.Status,
                    role = m.UserRole,
                    createdAt = m.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (member == null)
            {
                return NotFound(new
                {
                    message = "Member not found."
                });
            }

            return Ok(member);
        }

        // POST: api/Members
        [HttpPost]
        public async Task<ActionResult<object>> CreateMember(Member member)
        {
            var email = member.Email.Trim();

            var emailExists = await _context.Members
                .AnyAsync(m =>
                    m.Email.ToLower() == email.ToLower());

            if (emailExists)
            {
                return Conflict(new
                {
                    message =
                        "A member with this email already exists."
                });
            }

            var maxId = await _context.Members
                .Select(m => (decimal?)m.MemberId)
                .MaxAsync() ?? 0;

            member.MemberId = maxId + 1;
            member.CreatedAt = DateTime.Now;

            member.Name = member.Name.Trim();
            member.Email = email;

            if (string.IsNullOrWhiteSpace(member.Status))
            {
                member.Status = "Active";
            }

            if (string.IsNullOrWhiteSpace(member.UserRole))
            {
                member.UserRole = "Member";
            }

            if (!string.IsNullOrWhiteSpace(member.Password))
            {
                member.Password =
                    BCrypt.Net.BCrypt.HashPassword(
                        member.Password);
            }

            _context.Members.Add(member);

            await _context.SaveChangesAsync();

            var response = new
            {
                memberId = member.MemberId,
                name = member.Name,
                email = member.Email,
                phone = member.Phone,
                status = member.Status,
                role = member.UserRole,
                createdAt = member.CreatedAt
            };

            return CreatedAtAction(
                nameof(GetMember),
                new { id = member.MemberId },
                response
            );
        }

        // PUT: api/Members/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMember(
            decimal id,
            UpdateMemberRequest member)
        {
            if (id != member.MemberId)
            {
                return BadRequest(new
                {
                    message =
                        "Member ID in the URL does not match the Member ID in the request body."
                });
            }

            var existingMember = await _context.Members
                .FirstOrDefaultAsync(m => m.MemberId == id);

            if (existingMember == null)
            {
                return NotFound(new
                {
                    message = "Member not found."
                });
            }

            var email = member.Email.Trim();

            // Check duplicate email
            var emailExists = await _context.Members
                .AnyAsync(m =>
                    m.Email.ToLower() == email.ToLower() &&
                    m.MemberId != id);

            if (emailExists)
            {
                return Conflict(new
                {
                    message =
                        "Another member already uses this email."
                });
            }

            // Update member details
            existingMember.Name =
                member.Name.Trim();

            existingMember.Email =
                email;

            existingMember.Phone =
                member.Phone;

            existingMember.Status =
                member.Status;

            if (!string.IsNullOrWhiteSpace(member.UserRole))
            {
                existingMember.UserRole =
                    member.UserRole.Trim();
            }

            // Only change password if a new password was entered
            if (!string.IsNullOrWhiteSpace(member.Password))
            {
                existingMember.Password =
                    BCrypt.Net.BCrypt.HashPassword(
                        member.Password);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Members/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMember(decimal id)
        {
            var member = await _context.Members
                .FirstOrDefaultAsync(m => m.MemberId == id);

            if (member == null)
            {
                return NotFound(new
                {
                    message = "Member not found."
                });
            }

            _context.Members.Remove(member);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict(new
                {
                    message =
                        "This member cannot be deleted because they are referenced by other records such as bookings, reviews, inquiries, or sports."
                });
            }

            return NoContent();
        }
    }
}