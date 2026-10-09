using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using PizzaciPOS.Models;
using System.Linq;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using PizzaciPOS;
using System;

namespace PizzaciPOS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RaporlamaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RaporlamaController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("SatisOzeti")]
        public async Task<ActionResult<SatisOzetiRaporuDto>> GetSatisOzeti([FromQuery] DateTime baslangic, [FromQuery] DateTime bitis)
        {
            try 
            {
                var siparisler = await _context.Siparisler
                    .Where(s => s.SiparisTarihi >= baslangic && s.SiparisTarihi <= bitis)
                    .ToListAsync();

                decimal toplamCiro = siparisler.Sum(s => s.ToplamTutar);
                decimal toplamMaliyet = siparisler.Sum(s => s.ToplamMaliyet);
                int siparisSayisi = siparisler.Count;

                return Ok(new SatisOzetiRaporuDto
                {
                    BaslangicTarihi = baslangic,
                    BitisTarihi = bitis,
                    ToplamSiparisSayisi = siparisSayisi,
                    ToplamCiro = toplamCiro,
                    ToplamMaliyet = toplamMaliyet,
                    NetKar = toplamCiro - toplamMaliyet,
                    OrtalamaSiparisTutari = siparisSayisi > 0 ? toplamCiro / siparisSayisi : 0m
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Rapor hesaplanırken hata oluştu.", Detail = ex.Message });
            }
        }

        [HttpGet("CokSatanlar")]
        public async Task<ActionResult<IEnumerable<CokSatanUrunDto>>> GetCokSatanUrunler()
        {
            try 
            {
                var enCokSatanDetaylar = await _context.SiparisDetaylari
                    .GroupBy(d => d.UrunCesitId)
                    .Select(g => new { UrunCesitId = g.Key, ToplamMiktar = g.Sum(d => d.Miktar) })
                    .OrderByDescending(x => x.ToplamMiktar)
                    .Take(10)
                    .ToListAsync();

                var urunCesitIds = enCokSatanDetaylar.Select(d => d.UrunCesitId).ToList();
                var urunCesitleri = await _context.UrunCesitleri
                    .Include(uc => uc.Urun)
                    .Where(uc => urunCesitIds.Contains(uc.Id))
                    .ToDictionaryAsync(uc => uc.Id);

                var raporSonucu = enCokSatanDetaylar.Select(adet =>
                {
                    if (urunCesitleri.TryGetValue(adet.UrunCesitId, out var uc) && uc?.Urun != null)
                    {
                        return new CokSatanUrunDto
                        {
                            UrunCesitId = uc.Id,
                            UrunAdi = $"{uc.Urun.Isim} ({uc.CesitAdi})",
                            SatilanMiktar = adet.ToplamMiktar
                        };
                    }
                    return null;
                }).Where(dto => dto != null).ToList();

                return Ok(raporSonucu);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Çok satanlar listeleri oluşturulamadı.", Detail = ex.Message });
            }
        }

        [HttpGet("KuryePerformans")]
        public async Task<ActionResult<IEnumerable<KuryePerformansDto>>> GetKuryePerformans()
        {
            try 
            {
                var tamamlanmisTeslimatlar = await _context.Teslimatlar
                    .Where(t => t.TeslimAlmaZamani.HasValue && t.TeslimZamani.HasValue)
                    .ToListAsync();

                var performans = tamamlanmisTeslimatlar
                    .GroupBy(t => t.KuryeUserId)
                    .Select(g => new KuryePerformansDto
                    {
                        KuryeUserId = g.Key,
                        ToplamTeslimatSayisi = g.Count(),
                        OrtalamaTeslimatSuresi = g.Average(t => (t.TeslimZamani!.Value - t.TeslimAlmaZamani!.Value).TotalMinutes)
                    })
                    .OrderBy(p => p.OrtalamaTeslimatSuresi)
                    .ToList();

                return Ok(performans);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Kurye performans raporu alınamadı.", Detail = ex.Message });
            }
        }
    }

    // =======================================================
    // DTOs
    // =======================================================
    public class SatisOzetiRaporuDto
    {
        public DateTime BaslangicTarihi { get; set; }
        public DateTime BitisTarihi { get; set; }
        public int ToplamSiparisSayisi { get; set; }
        public decimal ToplamCiro { get; set; }
        public decimal ToplamMaliyet { get; set; }
        public decimal NetKar { get; set; }
        public decimal OrtalamaSiparisTutari { get; set; }
    }

    public class CokSatanUrunDto
    {
        public int UrunCesitId { get; set; }
        public string? UrunAdi { get; set; }
        public int SatilanMiktar { get; set; }
    }

    public class KuryePerformansDto
    {
        public string? KuryeUserId { get; set; }
        public int ToplamTeslimatSayisi { get; set; }
        public double OrtalamaTeslimatSuresi { get; set; }
    }
}