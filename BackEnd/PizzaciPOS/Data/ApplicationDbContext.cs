// Data/ApplicationDbContext.cs

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PizzaciPOS.Models; // Diğer modellerinizi içerir
using PizzaciPOS;
// 🛑 KRİTİK EKLEME: Controller'ın PizzaciPOS.Data namespace'ine erişmesi için
namespace PizzaciPOS
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        // IdentityDbContext<ApplicationUser> sayesinde ApplicationUser tablosu otomatik oluşur.

        // Diğer POS tabloları:
        public DbSet<Pizza> Pizzalar { get; set; }
        public DbSet<Siparis> Siparisler { get; set; }

        public DbSet<Kategori> Kategoriler { get; set; }
        public DbSet<Urun> Urunler { get; set; }
        // 🛑 İsimlendirme: UrunCesitler değil, UrunCesitleri
        public DbSet<UrunCesit> UrunCesitleri { get; set; }
        public DbSet<Malzeme> Malzemeler { get; set; }
        public DbSet<Recete> Receteler { get; set; }
        public DbSet<KuryeBilgisi> KuryeBilgileri { get; set; }
        public DbSet<Teslimat> Teslimatlar { get; set; }
        public DbSet<KasaHareketi> KasaHareketleri { get; set; }
        public DbSet<SiparisDetay> SiparisDetaylari { get; set; }
        public DbSet<Masa> Masalar { get; set; }
        public DbSet<Musteri> Musteriler { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🛑 UYARI 1: Urun tablosundaki VarsayilanFiyat için (18 basamak, 2 ondalık)
            modelBuilder.Entity<Urun>()
                .Property(u => u.VarsayilanFiyat)
                .HasColumnType("decimal(18,2)");

            // 🛑 UYARI 2: UrunCesit tablosundaki EkFiyat için (18 basamak, 2 ondalık)
            modelBuilder.Entity<UrunCesit>()
                .Property(uc => uc.EkFiyat)
                .HasColumnType("decimal(18,2)");

            // Eğer Pizza tablonuzda da fiyat varsa onu da ekleyebilirsiniz:
            // modelBuilder.Entity<Pizza>().Property(p => p.Fiyat).HasColumnType("decimal(18,2)");
        }
    }
}