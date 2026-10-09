// Models/Recete.cs
using System.ComponentModel.DataAnnotations.Schema;

namespace PizzaciPOS.Models
{
    public class Recete
    {
        public int Id { get; set; }

        // İlişki: Hangi Ürün Çeşidine ait? (Örn: Orta Boy Pizza)
        public int UrunCesitId { get; set; }
        public UrunCesit UrunCesit { get; set; }

        // İlişki: Hangi Malzemeyi kullanıyor?
        public int MalzemeId { get; set; }
        public Malzeme Malzeme { get; set; }

        // Bu üründen bir adet üretmek için gereken malzeme miktarı
        [Column(TypeName = "decimal(18, 4)")] // Hassasiyet önemlidir
        public decimal KullanilanMiktar { get; set; }
    }
}
