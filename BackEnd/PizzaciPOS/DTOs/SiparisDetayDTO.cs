// PizzaciPOS/Models/DTOs/SiparisDetayDTO.cs

using System.ComponentModel.DataAnnotations;

namespace PizzaciPOS.DTOs
{
    public class SiparisDetayDTO
    {
        [Required]
        public int UrunId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Miktar { get; set; }

        // Fiyatı frontend'den alıp backend'de doğrulamak en iyisidir
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal BirimFiyat { get; set; }
    }
}