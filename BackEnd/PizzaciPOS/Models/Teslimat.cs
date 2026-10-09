// Models/Teslimat.cs
using System.ComponentModel.DataAnnotations.Schema;

namespace PizzaciPOS.Models
{
    public class Teslimat
    {
        public int Id { get; set; }

        // İlişki: Hangi sipariş teslim ediliyor?
        public int SiparisId { get; set; }
        public Siparis Siparis { get; set; }

        // İlişki: Hangi kurye tarafından teslim ediliyor?
        public string KuryeUserId { get; set; } // Kurye/ApplicationUser Id'si

        public string TeslimatBolgesi { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TeslimatUcreti { get; set; }

        public DateTime AtanmaZamani { get; set; } = DateTime.Now;
        public DateTime? TeslimAlmaZamani { get; set; } // Kuryenin siparişi restorandan aldığı zaman
        public DateTime? TeslimZamani { get; set; } // Müşteriye ulaştığı zaman
    }
}