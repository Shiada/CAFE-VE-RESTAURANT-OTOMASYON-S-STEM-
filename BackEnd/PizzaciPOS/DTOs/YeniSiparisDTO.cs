// PizzaciPOS/DTOs/YeniSiparisDTO.cs

using System.ComponentModel.DataAnnotations;
using System.Collections.Generic; // List<T> için gerekli

namespace PizzaciPOS.DTOs
{
    public class YeniSiparisDTO
    {
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal ToplamTutar { get; set; }

        [Required]
        public List<SiparisDetayDTO> SiparisDetaylari { get; set; } = new List<SiparisDetayDTO>();

        // 🛑 EKLENEN KRİTİK ALANLAR (CS1061 hatalarını çözmek için)
        public string MusteriAdres { get; set; } = string.Empty;
        public string MusteriTelefon { get; set; } = string.Empty;
        public string OdemeSekli { get; set; } = "Nakit";
        public int? MasaId { get; set; }
        public int? MusteriId { get; set; }
    }
}