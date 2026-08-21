using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SportsBooking.API.Models;

[PrimaryKey("MemberId", "SportId")]
[Table("MEMBER_SPORT")]
public partial class MemberSport
{
    [Key]
    [Column("MEMBER_ID", TypeName = "NUMBER")]
    public decimal MemberId { get; set; }

    [Key]
    [Column("SPORT_ID", TypeName = "NUMBER")]
    public decimal SportId { get; set; }

    [Column("JOINED_AT")]
    [Precision(6)]
    public DateTime JoinedAt { get; set; }

    [ForeignKey("MemberId")]
    [InverseProperty("MemberSports")]
    public virtual Member Member { get; set; } = null!;

    [ForeignKey("SportId")]
    [InverseProperty("MemberSports")]
    public virtual Sport Sport { get; set; } = null!;
}
