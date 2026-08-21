using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SportsBooking.API.Models;

[Table("INQUIRY")]
public partial class Inquiry
{
    [Key]
    [Column("INQUIRY_ID", TypeName = "NUMBER")]
    public decimal InquiryId { get; set; }

    [Column("MEMBER_ID", TypeName = "NUMBER")]
    public decimal MemberId { get; set; }

    [Column("NAME")]
    [StringLength(100)]
    [Unicode(false)]
    public string Name { get; set; } = null!;

    [Column("EMAIL")]
    [StringLength(100)]
    [Unicode(false)]
    public string Email { get; set; } = null!;

    [Column("SUBJECT")]
    [StringLength(150)]
    [Unicode(false)]
    public string Subject { get; set; } = null!;

    [Column("MESSAGE")]
    [StringLength(1000)]
    [Unicode(false)]
    public string Message { get; set; } = null!;

    [Column("STATUS")]
    [StringLength(20)]
    [Unicode(false)]
    public string Status { get; set; } = null!;

    [Column("CREATED_AT")]
    [Precision(6)]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("MemberId")]
    [InverseProperty("Inquiries")]
    public virtual Member Member { get; set; } = null!;
}
