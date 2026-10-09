using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using PizzaciPOS;
using PizzaciPOS.Models;
using PizzaciPOS.DTOs;
using Microsoft.Extensions.DependencyInjection;

namespace PizzaciPOS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SiparisYonetimiController : ControllerBase
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public SiparisYonetimiController(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        [HttpPost("YeniSiparisAl")]
        public async Task<IActionResult> YeniSiparisAl([FromBody] YeniSiparisDTO request)
        {
            if (request.SiparisDetaylari == null || !request.SiparisDetaylari.Any())
            {
                return BadRequest(new { Message = "Sepet boş olamaz." });
            }

            try
            {
                var result = await Task.Run(async () =>
                {
                    using var scope = _scopeFactory.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var strategy = context.Database.CreateExecutionStrategy();

                    return await strategy.ExecuteAsync(async () =>
                    {
                        using var transaction = await context.Database.BeginTransactionAsync();
                        try
                        {
                            decimal hesaplananToplamTutar = 0;
                            decimal toplamMaliyet = 0;
                            var siparisDetaylariListesi = new List<SiparisDetay>();

                            foreach (var detayDto in request.SiparisDetaylari)
                            {
                                var urunCesit = await context.UrunCesitleri
                                    .Include(uc => uc.Urun)
                                    .FirstOrDefaultAsync(uc => uc.Id == detayDto.UrunId);

                                if (urunCesit == null || urunCesit.Urun == null) continue;

                                decimal birimFiyat = urunCesit.Urun.VarsayilanFiyat + urunCesit.EkFiyat;
                                decimal araToplam = birimFiyat * detayDto.Miktar;
                                hesaplananToplamTutar += araToplam;

                                // 🧠 REÇETE MOTORU: Stok düşümü ve maliyet hesabı
                                decimal birimMaliyet = 0;
                                var receteler = await context.Receteler
                                    .Include(r => r.Malzeme)
                                    .Where(r => r.UrunCesitId == urunCesit.Id)
                                    .ToListAsync();

                                foreach (var recete in receteler)
                                {
                                    decimal toplamLazimMiktar = recete.KullanilanMiktar * detayDto.Miktar;
                                    
                                    // Stoktan Düş
                                    if (recete.Malzeme != null)
                                    {
                                        recete.Malzeme.StokMiktari -= toplamLazimMiktar;
                                        birimMaliyet += recete.KullanilanMiktar * recete.Malzeme.SonBirimMaliyet;
                                    }
                                }
                                
                                toplamMaliyet += birimMaliyet * detayDto.Miktar;

                                siparisDetaylariListesi.Add(new SiparisDetay
                                {
                                    UrunCesitId = urunCesit.Id,
                                    Miktar = detayDto.Miktar,
                                    BirimFiyat = birimFiyat,
                                    AraToplam = araToplam,
                                    BirimMaliyet = birimMaliyet,
                                    Notlar = ""
                                });
                            }

                            // 🏨 MASA YÖNETİMİ: Eğer masa ID geldiyse masayı dolu yap
                            if (request.MasaId.HasValue)
                            {
                                var masa = await context.Masalar.FindAsync(request.MasaId.Value);
                                if (masa != null)
                                {
                                    masa.Durum = "Dolu";
                                    masa.MasaTutari = hesaplananToplamTutar;
                                }
                            }

                            // 👤 MÜŞTERİ SADAKAT: Eğer müşteri ID geldiyse puan ekle ve istatistik güncelle
                            if (request.MusteriId.HasValue)
                            {
                                var musteri = await context.Musteriler.FindAsync(request.MusteriId.Value);
                                if (musteri != null)
                                {
                                    musteri.ToplamHarcama += hesaplananToplamTutar;
                                    musteri.SonSiparisTarihi = DateTime.UtcNow;
                                    musteri.Puan += hesaplananToplamTutar * 0.05m; // %5 Puan kazanımı
                                }
                            }

                            var siparis = new Siparis
                            {
                                SiparisTarihi = DateTime.UtcNow,
                                ToplamTutar = hesaplananToplamTutar,
                                ToplamMaliyet = toplamMaliyet,
                                KasiyerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "Sistem",
                                Durum = "Beklemede",
                                MusteriAdres = request.MusteriAdres,
                                MusteriTelefon = request.MusteriTelefon,
                                OdemeSekli = request.OdemeSekli,
                                Detaylar = siparisDetaylariListesi,
                                MasaId = request.MasaId,
                                MusteriId = request.MusteriId
                            };

                            context.Siparisler.Add(siparis);
                            await context.SaveChangesAsync();
                            await transaction.CommitAsync();

                            return new { id = siparis.Id, total = siparis.ToplamTutar };
                        }
                        catch (Exception ex)
                        {
                            await transaction.RollbackAsync();
                            throw ex;
                        }
                    });
                });

                return Ok(new { Message = "Sipariş (Reçete ve Stok Entegrasyonuyla) başarıyla kaydedildi.", SiparisId = result.id, ToplamTutar = result.total });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Sipariş işlenirken hata oluştu.", Detail = ex.Message });
            }
        }

        [HttpGet("AktifSiparisler")]
        public async Task<IActionResult> GetAktifSiparisler()
        {
            try 
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var aktifDurumlar = new List<string> { "Beklemede", "Hazırlanıyor", "Yolda" };

                var siparisler = await context.Siparisler
                    .Where(s => aktifDurumlar.Contains(s.Durum))
                    .Include(s => s.Detaylar!)
                    .ThenInclude(d => d.UrunCesit!)
                    .ThenInclude(uc => uc.Urun!)
                    .AsNoTracking()
                    .OrderByDescending(s => s.SiparisTarihi)
                    .ToListAsync();

                return Ok(siparisler);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Aktif siparişler listelenemedi.", Detail = ex.Message });
            }
        }
    }
}