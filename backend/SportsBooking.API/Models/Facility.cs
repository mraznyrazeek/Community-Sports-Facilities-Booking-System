using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SportsBooking.API.Models;

[Table("FACILITY")]
public partial class Facility
{
    [Key]
    [Column("FACILITY_ID", TypeName = "NUMBER")]
    public decimal FacilityId { get; set; }

    [Column("SPORT_ID", TypeName = "NUMBER")]
    public decimal SportId { get; set; }

    [Column("FACILITY_NAME")]
    [StringLength(100)]
    [Unicode(false)]
    public string FacilityName { get; set; } = null!;

    [Column("DESCRIPTION")]
    [StringLength(255)]
    [Unicode(false)]
    public string? Description { get; set; }

    [Column("LOCATION")]
    [StringLength(150)]
    [Unicode(false)]
    public string Location { get; set; } = null!;

    [Column("ADDRESS")]
    [StringLength(255)]
    [Unicode(false)]
    public string? Address { get; set; }

    [Column("OPENING_TIME")]
    [StringLength(10)]
    [Unicode(false)]
    public string? OpeningTime { get; set; }

    [Column("CLOSING_TIME")]
    [StringLength(10)]
    [Unicode(false)]
    public string? ClosingTime { get; set; }

    [Column("STATUS")]
    [StringLength(20)]
    [Unicode(false)]
    public string Status { get; set; } = null!;

    [InverseProperty("Facility")]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    [InverseProperty("Facility")]
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    [ForeignKey("SportId")]
    [InverseProperty("Facilities")]
    public virtual Sport Sport { get; set; } = null!;
}
