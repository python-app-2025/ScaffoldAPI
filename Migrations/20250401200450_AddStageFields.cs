using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScaffoldAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddStageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "acceptanceDate",
                table: "ScaffoldCards",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "acceptanceRequestDate",
                table: "ScaffoldCards",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "currentStage",
                table: "ScaffoldCards",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "dismantlingRequestDate",
                table: "ScaffoldCards",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "dismantlingRequestNumber",
                table: "ScaffoldCards",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "acceptanceDate",
                table: "ScaffoldCards");

            migrationBuilder.DropColumn(
                name: "acceptanceRequestDate",
                table: "ScaffoldCards");

            migrationBuilder.DropColumn(
                name: "currentStage",
                table: "ScaffoldCards");

            migrationBuilder.DropColumn(
                name: "dismantlingRequestDate",
                table: "ScaffoldCards");

            migrationBuilder.DropColumn(
                name: "dismantlingRequestNumber",
                table: "ScaffoldCards");
        }
    }
}
