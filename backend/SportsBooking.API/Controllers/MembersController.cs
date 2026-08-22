using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportsBooking.API.Models;

namespace SportsBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
                    createdAt = m.CreatedAt
                })
                .ToListAsync();

            return Ok(members);
        }


        // GET: api/Members/1
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
            // Check whether email already exists
            var emailExists = await _context.Members
                .AnyAsync(m => m.Email == member.Email);

            if (emailExists)
            {
                return Conflict(new
                {
                    message = "A member with this email already exists."
                });
            }

            // Generate next Member ID
            var maxId = await _context.Members
                .Select(m => (decimal?)m.MemberId)
                .MaxAsync() ?? 0;

            member.MemberId = maxId + 1;

            // Set default values
            member.CreatedAt = DateTime.Now;

            if (string.IsNullOrWhiteSpace(member.Status))
            {
                member.Status = "Active";
            }

            _context.Members.Add(member);

            await _context.SaveChangesAsync();

            // Return member without password
            var response = new
            {
                memberId = member.MemberId,
                name = member.Name,
                email = member.Email,
                phone = member.Phone,
                status = member.Status,
                createdAt = member.CreatedAt
            };

            return CreatedAtAction(
                nameof(GetMember),
                new { id = member.MemberId },
                response
            );
        }

        // PUT: api/Members/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMember(decimal id, Member member)
        {
            if (id != member.MemberId)
            {
                return BadRequest(new
                {
                    message = "Member ID in the URL does not match the Member ID in the request body."
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

            // Check if another member already uses this email
            var emailExists = await _context.Members
                .AnyAsync(m =>
                    m.Email == member.Email &&
                    m.MemberId != id);

            if (emailExists)
            {
                return Conflict(new
                {
                    message = "Another member already uses this email."
                });
            }

            // Update fields
            existingMember.Name = member.Name;
            existingMember.Email = member.Email;
            existingMember.Phone = member.Phone;
            existingMember.Status = member.Status;

            // Only update password if a new password was supplied
            if (!string.IsNullOrWhiteSpace(member.Password))
            {
                existingMember.Password = member.Password;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Members/1
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
                    message = "This member cannot be deleted because they are referenced by other records such as bookings, reviews, inquiries, or sports."
                });
            }

            return NoContent();
        }
    }
}