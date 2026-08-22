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
        public async Task<ActionResult<object>> Login(LoginRequest request)
        {
            var member = await _context.Members
                .FirstOrDefaultAsync(m =>
                    m.Email.ToLower() == request.Email.ToLower());

            if (member == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, member.Password))
            {
                return Unauthorized("Invalid email or password.");
            }

            if (!member.Status.Equals("Active", StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized("Your account is not active.");
            }

            var claims = new[]
            {
        new System.Security.Claims.Claim(
            System.Security.Claims.ClaimTypes.NameIdentifier,
            member.MemberId.ToString()),

        new System.Security.Claims.Claim(
            System.Security.Claims.ClaimTypes.Name,
            member.Name),

        new System.Security.Claims.Claim(
            System.Security.Claims.ClaimTypes.Email,
            member.Email)
    };

            var key = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(
                    HttpContext.RequestServices
                        .GetRequiredService<
                            Microsoft.Extensions.Configuration.IConfiguration>()
                        ["Jwt:Key"]!));

            var credentials =
                new Microsoft.IdentityModel.Tokens.SigningCredentials(
                    key,
                    Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256);

            var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
                issuer: HttpContext.RequestServices
                    .GetRequiredService<
                        Microsoft.Extensions.Configuration.IConfiguration>()
                    ["Jwt:Issuer"],

                audience: HttpContext.RequestServices
                    .GetRequiredService<
                        Microsoft.Extensions.Configuration.IConfiguration>()
                    ["Jwt:Audience"],

                claims: claims,

                expires: DateTime.UtcNow.AddMinutes(
                    double.Parse(
                        HttpContext.RequestServices
                            .GetRequiredService<
                                Microsoft.Extensions.Configuration.IConfiguration>()
                            ["Jwt:ExpiryMinutes"]!)),

                signingCredentials: credentials
            );

            var tokenString =
                new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler()
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
                    status = member.Status
                }
            });
        }
    }
}