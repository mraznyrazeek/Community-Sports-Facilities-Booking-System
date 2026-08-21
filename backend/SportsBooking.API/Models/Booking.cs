using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SportsBooking.API.Models;

[Table("BOOKING")]
public partial class Booking
{
    [Key]
    [Column("BOOKING_ID", TypeName = "NUMBER")]
    public decimal BookingId { get; set; }

    [Column("MEMBER_ID", TypeName = "NUMBER")]
    public decimal MemberId { get; set; }

    [Column("FACILITY_ID", TypeName = "NUMBER")]
    public decimal FacilityId { get; set; }

    [Column("BOOKING_DATE", TypeName = "DATE")]
    public DateTime BookingDate { get; set; }

    [Column("START_TIME")]
    [StringLength(10)]
    [Unicode(false)]
    public string StartTime { get; set; } = null!;

    [Column("END_TIME")]
    [StringLength(10)]
    [Unicode(false)]
    public string EndTime { get; set; } = null!;

    [Column("STATUS")]
    [StringLength(20)]
    [Unicode(false)]
    public string Status { get; set; } = null!;

    [Column("CREATED_AT")]
    [Precision(6)]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("FacilityId")]
    [InverseProperty("Bookings")]
    public virtual Facility Facility { get; set; } = null!;

    [ForeignKey("MemberId")]
    [InverseProperty("Bookings")]
    public virtual Member Member { get; set; } = null!;
}
