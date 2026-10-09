// Models/KasaHareketi.cs
using System.ComponentModel.DataAnnotations.Schema;

namespace PizzaciPOS.Models
{
    public class KasaHareketi
    {
        public int Id { get; set; }
        public DateTime Tarih { get; set; } = DateTime.Now;

        // Hangi kullanıcı (kasiyer) tarafından yapıldı?
        public string KasiyerUserId { get; set; }

        public string IslemTipi { get; set; } // Örn: Kasa Açılış, Satış, Masraf, Kasa Kapanış

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Miktar { get; set; }

        public int? SiparisId { get; set; } // Eğer işlem bir satışsa, hangi siparişe ait? (nullable)
        public string Aciklama { get; set; } // Örn: 'Ekmeğe giden para', 'Gün başı nakit girişi'
    }
}
