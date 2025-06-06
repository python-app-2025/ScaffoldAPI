﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ScaffoldAPI.Data;

#nullable disable

namespace ScaffoldAPI.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20250401210529_InitialCreate")]
    partial class InitialCreate
    {
       
       
       
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "9.0.3");

            modelBuilder.Entity("ScaffoldAPI.Models.DictionaryItem", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Value")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("DictionaryItems");
                });

            modelBuilder.Entity("ScaffoldAPI.Models.ScaffoldCard", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<DateTime?>("acceptanceDate")
                        .HasColumnType("TEXT");

                    b.Property<DateTime?>("acceptanceRequestDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("actNumber")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("currentStage")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("customer")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("dismantlingDate")
                        .HasColumnType("TEXT");

                    b.Property<DateTime?>("dismantlingRequestDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("dismantlingRequestNumber")
                        .HasColumnType("TEXT");

                    b.Property<decimal>("height")
                        .HasColumnType("TEXT");

                    b.Property<decimal>("length")
                        .HasColumnType("TEXT");

                    b.Property<string>("lmo")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("location")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("mountingDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("operatingOrganization")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("ownership")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("project")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("requestDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("requestNumber")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("scaffoldType")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("sppElement")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("status")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<decimal>("volume")
                        .ValueGeneratedOnAddOrUpdate()
                        .HasColumnType("TEXT")
                        .HasComputedColumnSql("[length]*[width]*[height]");

                    b.Property<decimal>("width")
                        .HasColumnType("TEXT");

                    b.Property<string>("workType")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("project", "status", "mountingDate");

                    b.ToTable("ScaffoldCards");
                });
#pragma warning restore 612, 618
        }
    }
}
