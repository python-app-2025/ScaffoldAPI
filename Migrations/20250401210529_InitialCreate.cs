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
                    lmo = table.Column<string>(type: "TEXT", nullable: false),
                    actNumber = table.Column<string>(type: "TEXT", nullable: false),
                    requestNumber = table.Column<string>(type: "TEXT", nullable: false),
                    project = table.Column<string>(type: "TEXT", nullable: false),
                    sppElement = table.Column<string>(type: "TEXT", nullable: false),
                    location = table.Column<string>(type: "TEXT", nullable: false),
                    requestDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    mountingDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    dismantlingDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    acceptanceRequestDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    acceptanceDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    dismantlingRequestDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    dismantlingRequestNumber = table.Column<string>(type: "TEXT", nullable: true),
                    scaffoldType = table.Column<string>(type: "TEXT", nullable: false),
                    length = table.Column<decimal>(type: "TEXT", nullable: false),
                    width = table.Column<decimal>(type: "TEXT", nullable: false),
                    height = table.Column<decimal>(type: "TEXT", nullable: false),
                    volume = table.Column<decimal>(type: "TEXT", nullable: false, computedColumnSql: "[length]*[width]*[height]"),
                    workType = table.Column<string>(type: "TEXT", nullable: false),
                    customer = table.Column<string>(type: "TEXT", nullable: false),
                    operatingOrganization = table.Column<string>(type: "TEXT", nullable: false),
                    ownership = table.Column<string>(type: "TEXT", nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false),
                    currentStage = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScaffoldCards", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScaffoldCards_project_status_mountingDate",
                table: "ScaffoldCards",
                columns: new[] { "project", "status", "mountingDate" });
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
