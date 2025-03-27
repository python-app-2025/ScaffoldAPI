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
    [Migration("20250320205643_InitialCreate")]
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

                    b.Property<string>("ActNumber")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Customer")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("DismantlingDate")
                        .HasColumnType("TEXT");

                    b.Property<decimal>("Height")
                        .HasColumnType("TEXT");

                    b.Property<string>("LMO")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<decimal>("Length")
                        .HasColumnType("TEXT");

                    b.Property<string>("Location")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("MountingDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("OperatingOrganization")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Ownership")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Project")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("RequestDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("RequestNumber")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("ScaffoldType")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("SppElement")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<decimal>("Width")
                        .HasColumnType("TEXT");

                    b.Property<string>("WorkType")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("ScaffoldCards");
                });
#pragma warning restore 612, 618
        }
    }
}
