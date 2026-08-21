using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SportsBooking.API.Models;

[Table("MEMBER")]
public partial class Member
{
    [Key]
    [Column("MEMBER_ID", TypeName = "NUMBER")]
    public decimal MemberId { get; set; }

    [Column("NAME")]
    [StringLength(100)]
    [Unicode(false)]
    public string Name { get; set; } = null!;

    [Column("EMAIL")]
    [StringLength(150)]
    [Unicode(false)]
    public string Email { get; set; } = null!;

    [Column("PHONE")]
    [StringLength(20)]
    [Unicode(false)]
    public string? Phone { get; set; }

    [Column("PASSWORD")]
    [StringLength(255)]
    [Unicode(false)]
    public string Password { get; set; } = null!;

    [Column("STATUS")]
    [StringLength(20)]
    [Unicode(false)]
    public string Status { get; set; } = null!;

    [Column("CREATED_AT")]
    [Precision(6)]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Member")]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    [InverseProperty("Member")]
    public virtual ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();

    [InverseProperty("Member")]
    public virtual ICollection<MemberSport> MemberSports { get; set; } = new List<MemberSport>();

    [InverseProperty("Member")]
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
