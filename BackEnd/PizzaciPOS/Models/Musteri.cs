using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PizzaciPOS.Models
{
    public class Musteri
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Isim { get; set; }

        [Required]
        [MaxLength(20)]
        public string Telefon { get; set; }

        public string? Email { get; set; }

        public string? Adres { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Puan { get; set; } = 0; // Alışverişlerden biriken sadakat puanı

        public DateTime KayitTarihi { get; set; } = DateTime.UtcNow;

        // Son sipariş bilgilerini hızlıca görmek için
        public DateTime? SonSiparisTarihi { get; set; }
        
        [Column(TypeName = "decimal(18, 2)")]
        public decimal ToplamHarcama { get; set; } = 0;
    }
}
