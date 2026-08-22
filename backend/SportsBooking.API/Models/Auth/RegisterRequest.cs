using System.ComponentModel.DataAnnotations;

namespace SportsBooking.API.Models.Auth
{
    public class RegisterRequest
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = null!;

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = null!;

        [StringLength(20)]
        public string? Phone { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;
    }
}