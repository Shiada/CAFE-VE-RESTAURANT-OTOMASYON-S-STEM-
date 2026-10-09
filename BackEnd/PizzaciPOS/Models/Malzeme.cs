// Models/Malzeme.cs
using System.ComponentModel.DataAnnotations.Schema;

namespace PizzaciPOS.Models
{
    public class Malzeme
    {
        public int Id { get; set; }
        public string Isim { get; set; } // Örn: Peynir, Domates Sosu, Un
        public string Birim { get; set; } // Örn: kg, adet, litre

        [Column(TypeName = "decimal(18, 2)")]
        public decimal StokMiktari { get; set; } // Mevcut stok

        [Column(TypeName = "decimal(18, 2)")]
        public decimal SonBirimMaliyet { get; set; } // En son alış fiyatı / kg

        [Column(TypeName = "decimal(18, 2)")]
        public decimal KritikSeviye { get; set; } // Alarm eşiği
    }
}
