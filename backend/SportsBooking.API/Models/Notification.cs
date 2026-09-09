using System;

namespace SportsBooking.API.Models
{
    public class Notification
    {
        public decimal NotificationId { get; set; }

        public decimal MemberId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public string? ReferenceType { get; set; }

        public decimal? ReferenceId { get; set; }

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; }

        public virtual Member? Member { get; set; }
    }
}