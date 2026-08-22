namespace SportsBooking.API.Models
{
    public class InquiryCreateRequest
    {
        public string Subject { get; set; } = null!;

        public string Message { get; set; } = null!;
    }
}