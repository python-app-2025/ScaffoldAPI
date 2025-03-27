using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScaffoldAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DictionaryItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Value = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DictionaryItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ScaffoldCards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    LMO = table.Column<string>(type: "TEXT", nullable: false),
                    ActNumber = table.Column<string>(type: "TEXT", nullable: false),
                    RequestNumber = table.Column<string>(type: "TEXT", nullable: false),
                    Project = table.Column<string>(type: "TEXT", nullable: false),
                    SppElement = table.Column<string>(type: "TEXT", nullable: false),
                    Location = table.Column<string>(type: "TEXT", nullable: false),
                    RequestDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    MountingDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DismantlingDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ScaffoldType = table.Column<string>(type: "TEXT", nullable: false),
                    Length = table.Column<decimal>(type: "TEXT", nullable: false),
                    Width = table.Column<decimal>(type: "TEXT", nullable: false),
                    Height = table.Column<decimal>(type: "TEXT", nullable: false),
                    WorkType = table.Column<string>(type: "TEXT", nullable: false),
                    Customer = table.Column<string>(type: "TEXT", nullable: false),
                    OperatingOrganization = table.Column<string>(type: "TEXT", nullable: false),
                    Ownership = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScaffoldCards", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DictionaryItems");

            migrationBuilder.DropTable(
                name: "ScaffoldCards");
        }
    }
}
