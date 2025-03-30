using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScaffoldAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAnalyticsIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "volume",
                table: "ScaffoldCards",
                type: "TEXT",
                nullable: false,
                computedColumnSql: "[length]*[width]*[height]");

            migrationBuilder.CreateIndex(
                name: "IX_ScaffoldCards_project_status_mountingDate",
                table: "ScaffoldCards",
                columns: new[] { "project", "status", "mountingDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ScaffoldCards_project_status_mountingDate",
                table: "ScaffoldCards");

            migrationBuilder.DropColumn(
                name: "volume",
                table: "ScaffoldCards");
        }
    }
}
