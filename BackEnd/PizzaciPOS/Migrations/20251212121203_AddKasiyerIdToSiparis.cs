using PizzaciPOS;
using Microsoft.EntityFrameworkCore.Migrations;



#nullable disable

namespace PizzaciPOS.Migrations
{
    /// <inheritdoc />
    public partial class AddKasiyerIdToSiparis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "KasiyerId",
                table: "Siparisler",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Siparisler_KasiyerId",
                table: "Siparisler",
                column: "KasiyerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Siparisler_AspNetUsers_KasiyerId",
                table: "Siparisler",
                column: "KasiyerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Siparisler_AspNetUsers_KasiyerId",
                table: "Siparisler");

            migrationBuilder.DropIndex(
                name: "IX_Siparisler_KasiyerId",
                table: "Siparisler");

            migrationBuilder.DropColumn(
                name: "KasiyerId",
                table: "Siparisler");
        }
    }
}
