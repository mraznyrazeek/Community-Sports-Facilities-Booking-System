using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SportsBooking.API.Models;

[Table("INQUIRY_RESPONSE")]
public partial class InquiryResponse
{
    [Key]
    [Column("RESPONSE_ID", TypeName = "NUMBER")]
    public decimal ResponseId { get; set; }

    [Column("INQUIRY_ID", TypeName = "NUMBER")]
    public decimal InquiryId { get; set; }

    [Column("SENDER_ROLE")]
    [StringLength(20)]
    [Unicode(false)]
    public string SenderRole { get; set; } = null!;

    [Column("MESSAGE")]
    [StringLength(1000)]
    [Unicode(false)]
    public string Message { get; set; } = null!;

    [Column("CREATED_AT")]
    [Precision(6)]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("InquiryId")]
    [InverseProperty("Responses")]
    [JsonIgnore]
    public virtual Inquiry Inquiry { get; set; } = null!;
}