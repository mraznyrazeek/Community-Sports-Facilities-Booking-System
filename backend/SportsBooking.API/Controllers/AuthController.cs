using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SportsBooking.API.Models;
using SportsBooking.API.Models.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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

        [Authorize(Roles = "Admin")]
        [HttpPut("change-password")]
        public async Task<ActionResult<object>> ChangePassword(
            ChangePasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            {
                return BadRequest(new
                {
                    message = "Current password is required."
                });
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new
                {
                    message = "New password is required."
                });
            }

            if (request.NewPassword.Length < 8)
            {
                return BadRequest(new
                {
                    message =
                        "New password must be at least 8 characters long."
                });
            }

            if (!request.NewPassword.Any(char.IsUpper))
            {
                return BadRequest(new
                {
                    message =
                        "New password must contain at least one uppercase letter."
                });
            }

            var memberIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (memberIdClaim == null ||
                !decimal.TryParse(
                    memberIdClaim.Value,
                    out var memberId))
            {
                return Unauthorized(new
                {
                    message =
                        "Unable to identify the logged-in administrator."
                });
            }

            var member = await _context.Members
                .FirstOrDefaultAsync(m =>
                    m.MemberId == memberId);

            if (member == null)
            {
                return NotFound(new
                {
                    message = "Administrator account not found."
                });
            }

            if (!member.UserRole.Equals(
                    "Admin",
                    StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            if (!BCrypt.Net.BCrypt.Verify(
                    request.CurrentPassword,
                    member.Password))
            {
                return BadRequest(new
                {
                    message = "Current password is incorrect."
                });
            }

            if (BCrypt.Net.BCrypt.Verify(
                    request.NewPassword,
                    member.Password))
            {
                return BadRequest(new
                {
                    message =
                        "New password must be different from your current password."
                });
            }

            member.Password =
                BCrypt.Net.BCrypt.HashPassword(
                    request.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Password changed successfully."
            });
        }

        [Authorize(Roles = "Member")]
        [HttpPut("member/change-password")]
        public async Task<ActionResult<object>> ChangeMemberPassword(
            ChangePasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            {
                return BadRequest(new
                {
                    message = "Current password is required."
                });
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new
                {
                    message = "New password is required."
                });
            }

            if (request.NewPassword.Length < 8)
            {
                return BadRequest(new
                {
                    message =
                        "New password must be at least 8 characters long."
                });
            }

            if (!request.NewPassword.Any(char.IsUpper))
            {
                return BadRequest(new
                {
                    message =
                        "New password must contain at least one uppercase letter."
                });
            }

            var memberIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (memberIdClaim == null ||
                !decimal.TryParse(
                    memberIdClaim.Value,
                    out var memberId))
            {
                return Unauthorized(new
                {
                    message = "Unable to identify your account."
                });
            }

            var member = await _context.Members
                .FirstOrDefaultAsync(m =>
                    m.MemberId == memberId);

            if (member == null)
            {
                return NotFound(new
                {
                    message = "Member account not found."
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

            if (!BCrypt.Net.BCrypt.Verify(
                    request.CurrentPassword,
                    member.Password))
            {
                return BadRequest(new
                {
                    message = "Current password is incorrect."
                });
            }

            if (BCrypt.Net.BCrypt.Verify(
                    request.NewPassword,
                    member.Password))
            {
                return BadRequest(new
                {
                    message =
                        "New password must be different from your current password."
                });
            }

            member.Password =
                BCrypt.Net.BCrypt.HashPassword(
                    request.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Password changed successfully."
            });
        }

        [Authorize(Roles = "Member")]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateMyProfile(
            UpdateProfileRequest request)
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

            var memberIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (memberIdClaim == null ||
                !decimal.TryParse(
                    memberIdClaim.Value,
                    out var memberId))
            {
                return Unauthorized(new
                {
                    message = "Unable to identify your account."
                });
            }

            var member = await _context.Members
                .FirstOrDefaultAsync(m =>
                    m.MemberId == memberId);

            if (member == null)
            {
                return NotFound(new
                {
                    message = "Member account not found."
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

            var email = request.Email.Trim();

            var emailExists = await _context.Members
                .AnyAsync(m =>
                    m.MemberId != memberId &&
                    m.Email.ToLower() == email.ToLower());

            if (emailExists)
            {
                return Conflict(new
                {
                    message =
                        "Another member already uses this email."
                });
            }

            member.Name = request.Name.Trim();
            member.Email = email;
            member.Phone =
                string.IsNullOrWhiteSpace(request.Phone)
                    ? null
                    : request.Phone.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile updated successfully.",
                member = new
                {
                    memberId = member.MemberId,
                    name = member.Name,
                    email = member.Email,
                    phone = member.Phone,
                    status = member.Status,
                    role = member.UserRole
                }
            });
        }

        [Authorize(Roles = "Member")]
        [HttpPut("deactivate-account")]
        public async Task<IActionResult> DeactivateAccount()
        {
            var memberIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (memberIdClaim == null ||
                !decimal.TryParse(
                    memberIdClaim.Value,
                    out var memberId))
            {
                return Unauthorized(new
                {
                    message = "Unable to identify your account."
                });
            }

            var member = await _context.Members
                .FirstOrDefaultAsync(m =>
                    m.MemberId == memberId);

            if (member == null)
            {
                return NotFound(new
                {
                    message = "Member account not found."
                });
            }

            if (!member.Status.Equals(
                    "Active",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Your account is already inactive."
                });
            }

            member.Status = "Inactive";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Your account has been deactivated successfully."
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admins")]
        public async Task<ActionResult<object>> GetAdmins()
        {
            var admins = await _context.Members
                .Where(m =>
                    m.UserRole.ToLower() == "admin" &&
                    m.Status.ToLower() == "active")
                .OrderBy(m => m.Name)
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

            return Ok(admins);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("admins/{id}")]
        public async Task<ActionResult<object>> DeleteAdmin(
            decimal id)
        {
            var currentAdminClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (currentAdminClaim == null ||
                !decimal.TryParse(
                    currentAdminClaim.Value,
                    out var currentAdminId))
            {
                return Unauthorized(new
                {
                    message =
                        "Unable to identify the logged-in administrator."
                });
            }

            if (currentAdminId == id)
            {
                return BadRequest(new
                {
                    message =
                        "You cannot delete your own administrator account."
                });
            }

            var admin = await _context.Members
                .FirstOrDefaultAsync(m =>
                    m.MemberId == id &&
                    m.UserRole.ToLower() == "admin");

            if (admin == null)
            {
                return NotFound(new
                {
                    message =
                        "Administrator account not found."
                });
            }

            admin.Status = "Inactive";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Administrator account removed successfully."
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("admins/{id}/password")]
        public async Task<ActionResult<object>> ResetAdminPassword(
            decimal id,
            ResetAdminPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new
                {
                    message = "New password is required."
                });
            }

            if (request.NewPassword.Length < 8)
            {
                return BadRequest(new
                {
                    message =
                        "New password must be at least 8 characters long."
                });
            }

            var admin = await _context.Members
                .FirstOrDefaultAsync(m =>
                    m.MemberId == id &&
                    m.UserRole.ToLower() == "admin");

            if (admin == null)
            {
                return NotFound(new
                {
                    message =
                        "Administrator account not found."
                });
            }

            admin.Password =
                BCrypt.Net.BCrypt.HashPassword(
                    request.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Administrator password updated successfully."
            });
        }

        [AllowAnonymous]
        [HttpPost("reactivate")]
        public async Task<ActionResult<object>> ReactivateAccount(
    ReactivateAccountRequest request)
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

            if (member.Status.Equals(
                    "Active",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Your account is already active."
                });
            }

            member.Status = "Active";

            await _context.SaveChangesAsync();

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
                message = "Your account has been reactivated successfully.",
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

    public class UpdateProfileRequest
    {
        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }
    }
}