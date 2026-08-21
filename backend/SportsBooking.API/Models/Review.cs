using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SportsBooking.API.Models;

[Table("REVIEW")]
public partial class Review
{
    [Key]
    [Column("REVIEW_ID", TypeName = "NUMBER")]
    public decimal ReviewId { get; set; }

    [Column("MEMBER_ID", TypeName = "NUMBER")]
    public decimal MemberId { get; set; }

    [Column("FACILITY_ID", TypeName = "NUMBER")]
    public decimal FacilityId { get; set; }

    [Column("RATING", TypeName = "NUMBER")]
    public decimal Rating { get; set; }

    [Column("COMMENT_TEXT")]
    [StringLength(500)]
    [Unicode(false)]
    public string? CommentText { get; set; }

    [Column("CREATED_AT")]
    [Precision(6)]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("FacilityId")]
    [InverseProperty("Reviews")]
    public virtual Facility Facility { get; set; } = null!;

    [ForeignKey("MemberId")]
    [InverseProperty("Reviews")]
    public virtual Member Member { get; set; } = null!;
}
