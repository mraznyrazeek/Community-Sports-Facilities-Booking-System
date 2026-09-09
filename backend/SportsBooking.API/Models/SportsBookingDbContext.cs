using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace SportsBooking.API.Models;

public partial class SportsBookingDbContext : DbContext
{
    public SportsBookingDbContext()
    {
    }

    public SportsBookingDbContext(
        DbContextOptions<SportsBookingDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<Facility> Facilities { get; set; }

    public virtual DbSet<Inquiry> Inquiries { get; set; }

    public virtual DbSet<InquiryResponse> InquiryResponses { get; set; }

    public virtual DbSet<Member> Members { get; set; }

    public virtual DbSet<MemberSport> MemberSports { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Sport> Sports { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasDefaultSchema("SPORTS_BOOKING")
            .UseCollation("USING_NLS_COMP");


        // ============================================================
        // BOOKING
        // ============================================================

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.Property(e => e.BookingId)
                .ValueGeneratedOnAdd();

            // DATABASE GENERATES CREATED_AT
            entity.Property(e => e.CreatedAt)
                .HasColumnName("CREATED_AT")
                .HasDefaultValueSql("SYSTIMESTAMP")
                .ValueGeneratedOnAdd();

            entity.HasOne(d => d.Facility)
                .WithMany(p => p.Bookings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("BOOKING_FACILITY_FK");

            entity.HasOne(d => d.Member)
                .WithMany(p => p.Bookings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("BOOKING_MEMBER_FK");
        });


        // ============================================================
        // FACILITY
        // ============================================================

        modelBuilder.Entity<Facility>(entity =>
        {
            entity.Property(e => e.FacilityId)
                .ValueGeneratedOnAdd();

            entity.HasOne(d => d.Sport)
                .WithMany(p => p.Facilities)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FACILITY_SPORT_FK");
        });


        // ============================================================
        // INQUIRY
        // ============================================================

        modelBuilder.Entity<Inquiry>(entity =>
        {
            // DATABASE GENERATES INQUIRY_ID
            entity.Property(e => e.InquiryId)
                .ValueGeneratedOnAdd();

            // DATABASE GENERATES CREATED_AT
            entity.Property(e => e.CreatedAt)
                .HasColumnName("CREATED_AT")
                .HasDefaultValueSql("SYSTIMESTAMP")
                .ValueGeneratedOnAdd();

            entity.HasOne(d => d.Member)
                .WithMany(p => p.Inquiries)
                .HasForeignKey(d => d.MemberId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("INQUIRY_MEMBER_FK");
        });


        // ============================================================
        // INQUIRY RESPONSE
        // ============================================================

        modelBuilder.Entity<InquiryResponse>(entity =>
        {
            entity.HasKey(e => e.ResponseId);

            // DATABASE GENERATES RESPONSE_ID
            entity.Property(e => e.ResponseId)
                .ValueGeneratedOnAdd();

            // DATABASE GENERATES CREATED_AT
            entity.Property(e => e.CreatedAt)
                .HasColumnName("CREATED_AT")
                .HasDefaultValueSql("SYSTIMESTAMP")
                .ValueGeneratedOnAdd();

            entity.HasOne(d => d.Inquiry)
                .WithMany(p => p.Responses)
                .HasForeignKey(d => d.InquiryId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_INQUIRY_RESPONSE_INQUIRY");
        });


        // ============================================================
        // MEMBER
        // ============================================================

        modelBuilder.Entity<Member>(entity =>
        {
            entity.HasKey(e => e.MemberId)
                .HasName("PK_MEMBER_ID");

            // DATABASE GENERATES MEMBER_ID
            entity.Property(e => e.MemberId)
                .ValueGeneratedOnAdd();

            // DATABASE GENERATES CREATED_AT
            entity.Property(e => e.CreatedAt)
                .HasColumnName("CREATED_AT")
                .HasDefaultValueSql("SYSTIMESTAMP")
                .ValueGeneratedOnAdd();
        });


        // ============================================================
        // MEMBER SPORT
        // ============================================================

        modelBuilder.Entity<MemberSport>(entity =>
        {
            entity.HasOne(d => d.Member)
                .WithMany(p => p.MemberSports)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("MEMBER_SPORT_MEMBER_FK");

            entity.HasOne(d => d.Sport)
                .WithMany(p => p.MemberSports)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("MEMBER_SPORT_SPORT_FK");

            // DATABASE GENERATES JOIN DATE
            entity.Property(e => e.JoinedAt)
                .ValueGeneratedOnAdd();
        });


        // ============================================================
        // REVIEW
        // ============================================================

        modelBuilder.Entity<Review>(entity =>
        {
            // DATABASE GENERATES REVIEW_ID
            entity.Property(e => e.ReviewId)
                .ValueGeneratedOnAdd();

            // DATABASE GENERATES CREATED_AT
            entity.Property(e => e.CreatedAt)
                .HasColumnName("CREATED_AT")
                .HasDefaultValueSql("SYSTIMESTAMP")
                .ValueGeneratedOnAdd();

            entity.HasOne(d => d.Facility)
                .WithMany(p => p.Reviews)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("REVIEW_FACILITY_FK");

            entity.HasOne(d => d.Member)
                .WithMany(p => p.Reviews)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("REVIEW_MEMBER_FK");
        });


        // ============================================================
        // SPORT
        // ============================================================

        modelBuilder.Entity<Sport>(entity =>
        {
            entity.HasKey(e => e.SportId);

            // DATABASE GENERATES SPORT_ID
            entity.Property(e => e.SportId)
                .ValueGeneratedOnAdd();
        });


        // ============================================================
        // NOTIFICATION
        // ============================================================

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("NOTIFICATION");

            entity.HasKey(e => e.NotificationId)
                .HasName("PK_NOTIFICATION");

            // DATABASE GENERATES NOTIFICATION_ID
            entity.Property(e => e.NotificationId)
                .HasColumnName("NOTIFICATION_ID")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.MemberId)
                .HasColumnName("MEMBER_ID");

            entity.Property(e => e.Title)
                .HasColumnName("TITLE")
                .HasMaxLength(200);

            entity.Property(e => e.Message)
                .HasColumnName("MESSAGE")
                .HasMaxLength(1000);

            entity.Property(e => e.Type)
                .HasColumnName("TYPE")
                .HasMaxLength(30);

            entity.Property(e => e.ReferenceType)
                .HasColumnName("REFERENCE_TYPE")
                .HasMaxLength(30);

            entity.Property(e => e.ReferenceId)
                .HasColumnName("REFERENCE_ID");

            entity.Property(e => e.IsRead)
                .HasColumnName("IS_READ")
                .HasConversion<int>()
                .HasDefaultValue(0);

            // DATABASE GENERATES CREATED_AT
            entity.Property(e => e.CreatedAt)
                .HasColumnName("CREATED_AT")
                .HasDefaultValueSql("SYSTIMESTAMP")
                .ValueGeneratedOnAdd();

            entity.HasOne(d => d.Member)
                .WithMany()
                .HasForeignKey(d => d.MemberId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("NOTIFICATION_MEMBER_FK");
        });


        OnModelCreatingPartial(modelBuilder);
    }


    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}