using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PizzaciPOS.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;

namespace PizzaciPOS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class YapayZekaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        // Not: Gerçek bir projede buraya Gemini/OpenAI API Client eklenir.
        // Şimdilik sistemin mantığını ve AI simülasyonunu (Mock) kuruyoruz.

        public YapayZekaController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("SoruSor")]
        public async Task<IActionResult> SoruSor([FromBody] AIQueryRequest request)
        {
            if (string.IsNullOrEmpty(request.Query)) return BadRequest("Soru boş olamaz.");

            // 1. Menü Verilerini Çek (AI'ya bağlam sağlamak için)
            var urunler = await _context.Urunler
                .Include(u => u.Kategori)
                .Select(u => new { u.Isim, u.VarsayilanFiyat, Kategori = u.Kategori.Ad })
                .ToListAsync();

            // 2. AI Mantığı (Simülasyon - Gerçek API gelene kadar akıllı cevaplar üretir)
            string cevap = ProcessMockAI(request.Query.ToLower(), urunler);

            return Ok(new { Answer = cevap });
        }

        private string ProcessMockAI(string query, dynamic urunler)
        {
            // Bütçe sorgusu
            if (query.Contains("bütçem") || query.Contains("tl") || query.Contains("limit"))
            {
                // Sayıları ayıkla
                var numbers = new string(query.Where(c => char.IsDigit(c)).ToArray());
                if (decimal.TryParse(numbers, out decimal budget))
                {
                    var uygunUrunler = new List<string>();
                    foreach (var u in urunler)
                    {
                        if (u.VarsayilanFiyat <= budget)
                            uygunUrunler.Add($"{u.Isim} ({u.VarsayilanFiyat} TL)");
                    }

                    if (uygunUrunler.Any())
                        return $"Bütçenize uygun seçenekler: {string.Join(", ", uygunUrunler.Take(3))}. Şimdiden afiyet olsun!";
                    else
                        return "Maalesef bu bütçeye uygun bir ürünümüz bulunmuyor, ancak atıştırmalıklarımıza göz atabilirsiniz.";
                }
            }

            // İçerik sorgusu (Fıstık, Acı, Tatlı vb.)
            if (query.Contains("fıstıklı") || query.Contains("tatlı") || query.Contains("içecek"))
            {
                string anahtar = query.Contains("fıstık") ? "fıstık" : (query.Contains("tatlı") ? "Tatlılar" : "İçecekler");
                var bulunanlar = new List<string>();
                
                foreach (var u in urunler)
                {
                    if (u.Isim.ToLower().Contains(anahtar) || u.Kategori.ToLower().Contains(anahtar))
                        bulunanlar.Add(u.Isim);
                }

                if (bulunanlar.Any())
                    return $"Aradığınız kriterlere uygun ürünlerimiz: {string.Join(", ", bulunanlar)}. Denemenizi öneririm!";
            }

            // Genel Cevap
            return "Hoş geldiniz! Ben restoranınızın AI asistanıyım. Size bütçenize uygun menüler önerebilir veya fıstıklı tatlılar gibi özel isteklerinize yardımcı olabilirim. Ne istersiniz?";
        }
    }

    public class AIQueryRequest
    {
        public string Query { get; set; }
    }
}
