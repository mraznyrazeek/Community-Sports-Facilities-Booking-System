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
    public class MemberSportsController : ControllerBase
    {
        private readonly SportsBookingDbContext _context;

        public MemberSportsController(SportsBookingDbContext context)
        {
            _context = context;
        }

        // GET: api/MemberSports
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetMemberSports()
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized();
            }

            var memberSports = await _context.MemberSports
                .Include(ms => ms.Member)
                .Include(ms => ms.Sport)
                .Where(ms => ms.MemberId == memberId.Value)
                .Select(ms => new
                {
                    memberId = ms.MemberId,
                    sportId = ms.SportId,
                    joinedAt = ms.JoinedAt,

                    sport = ms.Sport == null ? null : new
                    {
                        sportId = ms.Sport.SportId,
                        sportName = ms.Sport.SportName,
                        description = ms.Sport.Description
                    }
                })
                .ToListAsync();

            return Ok(memberSports);
        }

        // GET: api/MemberSports/1
        [HttpGet("{sportId}")]
        public async Task<ActionResult<object>> GetMemberSport(decimal sportId)
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized();
            }

            var memberSport = await _context.MemberSports
                .Include(ms => ms.Sport)
                .Where(ms =>
                    ms.MemberId == memberId.Value &&
                    ms.SportId == sportId)
                .Select(ms => new
                {
                    memberId = ms.MemberId,
                    sportId = ms.SportId,
                    joinedAt = ms.JoinedAt,

                    sport = ms.Sport == null ? null : new
                    {
                        sportId = ms.Sport.SportId,
                        sportName = ms.Sport.SportName,
                        description = ms.Sport.Description
                    }
                })
                .FirstOrDefaultAsync();

            if (memberSport == null)
            {
                return NotFound();
            }

            return Ok(memberSport);
        }

        // POST: api/MemberSports
        [HttpPost]
        public async Task<ActionResult<object>> CreateMemberSport(
            CreateMemberSportRequest request)
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized();
            }

            // Check if sport exists
            var sportExists = await _context.Sports
                .AnyAsync(s => s.SportId == request.SportId);

            if (!sportExists)
            {
                return BadRequest("Sport does not exist.");
            }

            // Check if current member is already registered
            var alreadyExists = await _context.MemberSports
                .AnyAsync(ms =>
                    ms.MemberId == memberId.Value &&
                    ms.SportId == request.SportId);

            if (alreadyExists)
            {
                return Conflict(
                    "You are already registered for this sport.");
            }

            var memberSport = new MemberSport
            {
                MemberId = memberId.Value,
                SportId = request.SportId,
                JoinedAt = DateTime.Now
            };

            _context.MemberSports.Add(memberSport);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetMemberSport),
                new
                {
                    sportId = memberSport.SportId
                },
                new
                {
                    memberId = memberSport.MemberId,
                    sportId = memberSport.SportId,
                    joinedAt = memberSport.JoinedAt
                });
        }

        // PUT: api/MemberSports/1
        [HttpPut("{sportId}")]
        public async Task<IActionResult> UpdateMemberSport(
            decimal sportId,
            UpdateMemberSportRequest request)
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized();
            }

            var memberSport = await _context.MemberSports
                .FirstOrDefaultAsync(ms =>
                    ms.MemberId == memberId.Value &&
                    ms.SportId == sportId);

            if (memberSport == null)
            {
                return NotFound();
            }

            memberSport.JoinedAt = request.JoinedAt;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/MemberSports/1
        [HttpDelete("{sportId}")]
        public async Task<IActionResult> DeleteMemberSport(decimal sportId)
        {
            var memberId = GetCurrentMemberId();

            if (memberId == null)
            {
                return Unauthorized();
            }

            var memberSport = await _context.MemberSports
                .FirstOrDefaultAsync(ms =>
                    ms.MemberId == memberId.Value &&
                    ms.SportId == sportId);

            if (memberSport == null)
            {
                return NotFound();
            }

            _context.MemberSports.Remove(memberSport);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Get logged-in member ID from JWT
        private decimal? GetCurrentMemberId()
        {
            var memberIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (decimal.TryParse(memberIdClaim, out var memberId))
            {
                return memberId;
            }

            return null;
        }
    }

    // Request model for POST
    public class CreateMemberSportRequest
    {
        public decimal SportId { get; set; }
    }

    // Request model for PUT
    public class UpdateMemberSportRequest
    {
        public DateTime JoinedAt { get; set; }
    }
}