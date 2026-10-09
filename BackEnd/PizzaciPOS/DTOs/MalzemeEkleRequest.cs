// PizzaciPOS/DTOs/MalzemeEkleRequest.cs

using System.ComponentModel.DataAnnotations;

namespace PizzaciPOS.DTOs // DTOs namespace'i kritik
{
    public class MalzemeEkleRequest
    {
        [Required]
        public string MalzemeAdi { get; set; } = string.Empty;

        [Required]
        public decimal StokMiktari { get; set; }

        [Required]
        [Range(0.01, (double)decimal.MaxValue)]
        public decimal SonBirimMaliyet { get; set; }
    }
}