using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportsBooking.API.Models;
using SportsBooking.API.Models.Auth;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace SportsBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly SportsBookingDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            SportsBookingDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<object>> Register(
            RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new
                {
                    message = "Name is required."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new
                {
                    message = "Email is required."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    message = "Password is required."
                });
            }

            var email = request.Email.Trim();

            var existingMember = await _context.Members
                .FirstOrDefaultAsync(m =>
                    m.Email.ToLower() == email.ToLower());

            if (existingMember != null)
            {
                return Conflict(new
                {
                    message = "An account with this email already exists."
                });
            }

            var lastMemberId = await _context.Members
                .Select(m => (decimal?)m.MemberId)
                .MaxAsync() ?? 0;

            var nextMemberId = lastMemberId + 1;

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(
                request.Password);

            var member = new Member
            {
                MemberId = nextMemberId,
                Name = request.Name.Trim(),
                Email = email,
                Phone = request.Phone,
                Password = passwordHash,
                Status = "Active",
                UserRole = "Member",
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
                role = member.UserRole,
                createdAt = member.CreatedAt
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<object>> Login(
            LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    message = "Email and password are required."
                });
            }

            var email = request.Email.Trim();

            var member = await _context.Members
                .FirstOrDefaultAsync(m =>
                    m.Email.ToLower() == email.ToLower());

            if (member == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            if (!BCrypt.Net.BCrypt.Verify(
                    request.Password,
                    member.Password))
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            if (!member.Status.Equals(
                    "Active",
                    StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized(new
                {
                    message = "Your account is not active."
                });
            }

            var userRole = string.IsNullOrWhiteSpace(member.UserRole)
                ? "Member"
                : member.UserRole.Trim();

            var claimsList = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    member.MemberId.ToString()),

                new Claim(
                    ClaimTypes.Name,
                    member.Name),

                new Claim(
                    ClaimTypes.Email,
                    member.Email),

                new Claim(
                    ClaimTypes.Role,
                    userRole)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!));

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            var expiryMinutes = double.TryParse(
                _configuration["Jwt:ExpiryMinutes"],
                out var minutes)
                ? minutes
                : 60;

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claimsList,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            var tokenString =
                new JwtSecurityTokenHandler()
                    .WriteToken(token);

            return Ok(new
            {
                message = "Login successful.",

                token = tokenString,

                member = new
                {
                    memberId = member.MemberId,
                    name = member.Name,
                    email = member.Email,
                    phone = member.Phone,
                    status = member.Status,
                    role = userRole
                }
            });
        }
    }
}