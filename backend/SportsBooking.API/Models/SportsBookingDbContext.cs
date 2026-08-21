using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace SportsBooking.API.Models;

public partial class SportsBookingDbContext : DbContext
{
    public SportsBookingDbContext()
    {
    }

    public SportsBookingDbContext(DbContextOptions<SportsBookingDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<Facility> Facilities { get; set; }

    public virtual DbSet<Inquiry> Inquiries { get; set; }

    public virtual DbSet<Member> Members { get; set; }

    public virtual DbSet<MemberSport> MemberSports { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Sport> Sports { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseOracle("User Id=SPORTS_BOOKING;Password=SportsBooking123;Data Source=localhost:1521/XEPDB1;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasDefaultSchema("SPORTS_BOOKING")
            .UseCollation("USING_NLS_COMP");

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasOne(d => d.Facility).WithMany(p => p.Bookings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("BOOKING_FACILITY_FK");

            entity.HasOne(d => d.Member).WithMany(p => p.Bookings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("BOOKING_MEMBER_FK");
        });

        modelBuilder.Entity<Facility>(entity =>
        {
            entity.HasOne(d => d.Sport).WithMany(p => p.Facilities)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FACILITY_SPORT_FK");
        });

        modelBuilder.Entity<Inquiry>(entity =>
        {
            entity.HasOne(d => d.Member).WithMany(p => p.Inquiries)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("INQUIRY_MEMBER_FK");
        });

        modelBuilder.Entity<Member>(entity =>
        {
            entity.HasKey(e => e.MemberId).HasName("PK_MEMBER_ID");
        });

        modelBuilder.Entity<MemberSport>(entity =>
        {
            entity.HasOne(d => d.Member).WithMany(p => p.MemberSports)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("MEMBER_SPORT_MEMBER_FK");

            entity.HasOne(d => d.Sport).WithMany(p => p.MemberSports)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("MEMBER_SPORT_SPORT_FK");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasOne(d => d.Facility).WithMany(p => p.Reviews)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("REVIEW_FACILITY_FK");

            entity.HasOne(d => d.Member).WithMany(p => p.Reviews)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("REVIEW_MEMBER_FK");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
