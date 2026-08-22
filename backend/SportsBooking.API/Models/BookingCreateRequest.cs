using System.ComponentModel.DataAnnotations;

namespace SportsBooking.API.Models
{
    public class BookingCreateRequest
    {
        [Required]
        public decimal MemberId { get; set; }

        [Required]
        public decimal FacilityId { get; set; }

        [Required]
        public DateTime BookingDate { get; set; }

        [Required]
        public string StartTime { get; set; } = null!;

        [Required]
        public string EndTime { get; set; } = null!;

        public string? Status { get; set; }
    }
}