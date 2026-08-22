using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportsBooking.API.Models;

namespace SportsBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
            var memberSports = await _context.MemberSports
                .Include(ms => ms.Member)
                .Include(ms => ms.Sport)
                .Select(ms => new
                {
                    memberId = ms.MemberId,
                    sportId = ms.SportId,
                    joinedAt = ms.JoinedAt,

                    member = ms.Member == null ? null : new
                    {
                        memberId = ms.Member.MemberId,
                        name = ms.Member.Name,
                        email = ms.Member.Email
                    },

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

        // GET: api/MemberSports/1/1
        [HttpGet("{memberId}/{sportId}")]
        public async Task<ActionResult<object>> GetMemberSport(
            decimal memberId,
            decimal sportId)
        {
            var memberSport = await _context.MemberSports
                .Include(ms => ms.Member)
                .Include(ms => ms.Sport)
                .Where(ms =>
                    ms.MemberId == memberId &&
                    ms.SportId == sportId)
                .Select(ms => new
                {
                    memberId = ms.MemberId,
                    sportId = ms.SportId,
                    joinedAt = ms.JoinedAt,

                    member = ms.Member == null ? null : new
                    {
                        memberId = ms.Member.MemberId,
                        name = ms.Member.Name,
                        email = ms.Member.Email
                    },

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
            // Check if member exists
            var memberExists = await _context.Members
                .AnyAsync(m => m.MemberId == request.MemberId);

            if (!memberExists)
            {
                return BadRequest("Member does not exist.");
            }

            // Check if sport exists
            var sportExists = await _context.Sports
                .AnyAsync(s => s.SportId == request.SportId);

            if (!sportExists)
            {
                return BadRequest("Sport does not exist.");
            }

            // Check if member is already registered for this sport
            var alreadyExists = await _context.MemberSports
                .AnyAsync(ms =>
                    ms.MemberId == request.MemberId &&
                    ms.SportId == request.SportId);

            if (alreadyExists)
            {
                return Conflict(
                    "This member is already registered for this sport.");
            }

            // Create new MemberSport
            var memberSport = new MemberSport
            {
                MemberId = request.MemberId,
                SportId = request.SportId,
                JoinedAt = DateTime.Now
            };

            _context.MemberSports.Add(memberSport);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetMemberSport),
                new
                {
                    memberId = memberSport.MemberId,
                    sportId = memberSport.SportId
                },
                new
                {
                    memberId = memberSport.MemberId,
                    sportId = memberSport.SportId,
                    joinedAt = memberSport.JoinedAt
                });
        }

        // PUT: api/MemberSports/1/1
        [HttpPut("{memberId}/{sportId}")]
        public async Task<IActionResult> UpdateMemberSport(
            decimal memberId,
            decimal sportId,
            UpdateMemberSportRequest request)
        {
            var memberSport = await _context.MemberSports
                .FirstOrDefaultAsync(ms =>
                    ms.MemberId == memberId &&
                    ms.SportId == sportId);

            if (memberSport == null)
            {
                return NotFound();
            }

            // We normally don't change MemberId/SportId.
            // Only JoinedAt can be updated.
            memberSport.JoinedAt = request.JoinedAt;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/MemberSports/1/1
        [HttpDelete("{memberId}/{sportId}")]
        public async Task<IActionResult> DeleteMemberSport(
            decimal memberId,
            decimal sportId)
        {
            var memberSport = await _context.MemberSports
                .FirstOrDefaultAsync(ms =>
                    ms.MemberId == memberId &&
                    ms.SportId == sportId);

            if (memberSport == null)
            {
                return NotFound();
            }

            _context.MemberSports.Remove(memberSport);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    // Request model for POST
    public class CreateMemberSportRequest
    {
        public decimal MemberId { get; set; }

        public decimal SportId { get; set; }
    }

    // Request model for PUT
    public class UpdateMemberSportRequest
    {
        public DateTime JoinedAt { get; set; }
    }
}