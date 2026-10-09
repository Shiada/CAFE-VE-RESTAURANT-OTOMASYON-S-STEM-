// Models/SiparisDetay.cs

using System.ComponentModel.DataAnnotations.Schema;

namespace PizzaciPOS.Models
{
    public class SiparisDetay
    {
        public int Id { get; set; } // Birincil Anahtar

        // İlişki: Hangi siparişe ait?
        public int SiparisId { get; set; }
        public Siparis? Siparis { get; set; } // Navigation Property

        // İlişki: Hangi ürün çeşidine (boyuta) ait?
        public int UrunCesitId { get; set; }
        public UrunCesit? UrunCesit { get; set; } // Navigation Property

        public int Miktar { get; set; }

        // Sipariş anındaki fiyat (fiyatlar değişse bile bu faturanın fiyatı sabit kalır)
        [Column(TypeName = "decimal(18, 2)")]
        public decimal BirimFiyat { get; set; }

        // 🛑 EKLENEN KRİTİK ALAN (CS1061 hatasını çözmek için)
        [Column(TypeName = "decimal(18, 2)")]
        public decimal AraToplam { get; set; }

        // YENİ EKLENEN: Ürünün birim maliyeti
        [Column(TypeName = "decimal(18, 2)")]
        public decimal BirimMaliyet { get; set; }

        // Bu ürüne özel indirim veya notlar buraya eklenebilir.
        public string Notlar { get; set; } = string.Empty;
    }
}