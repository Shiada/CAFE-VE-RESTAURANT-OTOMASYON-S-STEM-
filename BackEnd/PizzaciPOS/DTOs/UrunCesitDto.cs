using System.ComponentModel.DataAnnotations;

namespace PizzaciPOS.DTOs
{
    // Ürün içindeki çeşit detaylarını taşır
    public class UrunCesitDto
    {
        public int Id { get; set; }
        public string? CesitAdi { get; set; }
        public decimal EkFiyat { get; set; }
        // Urun nesnesine geri referans vermekten kaçınıyoruz!
    }
}