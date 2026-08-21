using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SportsBooking.API.Models;

[Table("SPORT")]
[Index("SportName", Name = "UQ_SPORT_NAME", IsUnique = true)]
public partial class Sport
{
    [Key]
    [Column("SPORT_ID", TypeName = "NUMBER")]
    public decimal SportId { get; set; }

    [Column("SPORT_NAME")]
    [StringLength(50)]
    [Unicode(false)]
    public string SportName { get; set; } = null!;

    [Column("DESCRIPTION")]
    [StringLength(255)]
    [Unicode(false)]
    public string? Description { get; set; }

    [InverseProperty("Sport")]
    public virtual ICollection<Facility> Facilities { get; set; } = new List<Facility>();

    [InverseProperty("Sport")]
    public virtual ICollection<MemberSport> MemberSports { get; set; } = new List<MemberSport>();
}
