// PizzaciPOS/DTOs/UrunEkleRequest.cs (SON KULLANIMA HAZIR VERSİYON)

using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace PizzaciPOS.DTOs
{
    public class UrunEkleRequest
    {
        // 1. İsim (Zorunlu String)
        [Required(ErrorMessage = "Ürün Adı (Isim) alanı zorunludur.")]
        public string Isim { get; set; } = string.Empty;

        // 2. Açıklama (Zorunlu String)
        [Required(ErrorMessage = "Açıklama alanı zorunludur.")]
        public string Aciklama { get; set; } = string.Empty;

        // 3. Kategori ID (Zorunlu int)
        // Nullable'ı kaldırıp, zorunlu hale getiriyoruz (veritabanı gereksinimi).
        [Required(ErrorMessage = "Kategori ID alanı zorunludur.")]
        public int KategoriId { get; set; }

        // 4. Çeşitler (Boş liste gönderilebilir, zorunlu değil)
        public List<string> Cesitler { get; set; } = new List<string>();

        // 5. Fiyat (Zorunlu Decimal)
        [Required(ErrorMessage = "Fiyat alanı zorunludur.")]
        // 🛑 KRİTİK DÜZELTME: Minimum değeri 0.00'a gevşeterek format hatası riskini azaltıyoruz.
        [Range(0.00, (double)decimal.MaxValue, ErrorMessage = "Fiyat negatif olamaz.")]
        public decimal Fiyat { get; set; }
    }
}