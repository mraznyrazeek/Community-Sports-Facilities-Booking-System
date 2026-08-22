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
                return BadRequest(
                    "An account with this email already exists.");
            }

            // Generate next Member ID
            var lastMemberId = await _context.Members
                .Select(m => (decimal?)m.MemberId)
                .MaxAsync() ?? 0;

            var nextMemberId = lastMemberId + 1;

            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(
                request.Password);

            var member = new Member
            {
                MemberId = nextMemberId,
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

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<ActionResult<object>> Login(
            LoginRequest request)
        {
            // Find member by email
            var member = await _context.Members
                .FirstOrDefaultAsync(m =>
                    m.Email.ToLower() == request.Email.ToLower());

            if (member == null)
            {
                return Unauthorized(
                    "Invalid email or password.");
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(
                    request.Password,
                    member.Password))
            {
                return Unauthorized(
                    "Invalid email or password.");
            }

            // Check account status
            if (!member.Status.Equals(
                    "Active",
                    StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized(
                    "Your account is not active.");
            }

            // JWT CLAIMS

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
                    member.Email)
            };

            // ADMIN ROLE

            var adminEmail = _configuration["Jwt:AdminEmail"];

            if (!string.IsNullOrWhiteSpace(adminEmail) &&
                member.Email.Equals(
                    adminEmail,
                    StringComparison.OrdinalIgnoreCase))
            {
                claimsList.Add(
                    new Claim(
                        ClaimTypes.Role,
                        "Admin"));
            }

            var claims = claimsList.ToArray();

            // JWT KEY

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!));

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);


            // CREATE TOKEN

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],

                audience: _configuration["Jwt:Audience"],

                claims: claims,

                expires: DateTime.UtcNow.AddMinutes(
                    double.Parse(
                        _configuration["Jwt:ExpiryMinutes"]!)),

                signingCredentials: credentials
            );

            var tokenString =
                new JwtSecurityTokenHandler()
                    .WriteToken(token);

            // LOGIN RESPONSE

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
                    status = member.Status
                }
            });
        }
    }
}