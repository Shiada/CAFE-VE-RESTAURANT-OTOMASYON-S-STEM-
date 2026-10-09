using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PizzaciPOS.Models
{
    public class Masa
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string MasaAdi { get; set; } // Örn: Masa 1, Teras 4, VIP 2

        [Required]
        public string Durum { get; set; } = "Bos"; // "Bos", "Dolu", "Kirli", "Rezerve"

        public int? AktifSiparisId { get; set; } // Masada oturan müşterinin siparişi

        [Column(TypeName = "decimal(18, 2)")]
        public decimal MasaTutari { get; set; } // Mevcut açık hesap

        public int Kapasite { get; set; } = 4;
        
        public string Konum { get; set; } = "Salon"; // "Salon", "Teras", "Bahce"
    }
}
