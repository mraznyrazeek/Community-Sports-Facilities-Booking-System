using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportsBooking.API.Models;
using SportsBooking.API.Models.Auth;

namespace SportsBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly SportsBookingDbContext _context;

        public AuthController(SportsBookingDbContext context)
        {
            _context = context;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<ActionResult<object>> Register(
            RegisterRequest request)
        {
            // Check if email already exists
            var existingMember = await _context.Members
                .FirstOrDefaultAsync(m =>
                    m.Email.ToLower() == request.Email.ToLower());

            if (existingMember != null)
            {
                return BadRequest("An account with this email already exists.");
            }

            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(
                request.Password);

            var member = new Member
            {
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                Password = passwordHash,
                Status = "Active",
                CreatedAt = DateTime.Now
            };

            _context.Members.Add(member);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Registration successful.",
                memberId = member.MemberId,
                name = member.Name,
                email = member.Email,
                phone = member.Phone,
                status = member.Status,
                createdAt = member.CreatedAt
            });
        }
    }
}