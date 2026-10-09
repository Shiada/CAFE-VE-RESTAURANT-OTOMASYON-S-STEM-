// Models/Pizza.cs

using System.ComponentModel.DataAnnotations.Schema;

namespace PizzaciPOS.Models
{
    public class Pizza
    {
        public int Id { get; set; } // Birincil Anahtar
        public string Isim { get; set; } // Örn: Karışık Pizza
        public string Aciklama { get; set; }

        // Fiyatı temsil eden temel alan. Fiyatlar genellikle ondalık (decimal) olarak tanımlanır.
        [Column(TypeName = "decimal(18, 2)")]
        public decimal TemelFiyat { get; set; }

        public bool AktifMi { get; set; } = true; // Menüde gösterilip gösterilmeyeceği

        // İlişki: Bir pizza birden fazla çeşit (boyut/hamur) içerebilir.
        public List<UrunCesit> Cesitler { get; set; }
    }
}
