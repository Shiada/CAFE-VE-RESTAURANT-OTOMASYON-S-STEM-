using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using PizzaciPOS.Models;
using System.Security.Claims;
using PizzaciPOS;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Kasiyer ve Yönetici erişebilir
public class MuhasebeController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MuhasebeController(ApplicationDbContext context)
    {
        _context = context;
    }

    // =======================================================
    // KASA İŞLEMLERİ
    // =======================================================

    // POST: api/Muhasebe/KasaAcilisi
    // Kasiyerin gün başlangıcında kasaya girdiği nakit tutarı kaydeder
    [HttpPost("KasaAcilisi")]
    [Authorize(Roles = "Kasiyer, Yonetici")]
    public async Task<IActionResult> KasaAcilisi([FromBody] decimal baslangicMiktari)
    {
        var kasaHareketi = new KasaHareketi
        {
            KasiyerUserId = User.FindFirstValue(ClaimTypes.NameIdentifier), // Token'dan kasiyer ID'sini alır
            IslemTipi = "Kasa Açılış",
            Miktar = baslangicMiktari,
            Aciklama = "Gün başlangıcı açılış bakiyesi"
        };

        _context.KasaHareketleri.Add(kasaHareketi);
        await _context.SaveChangesAsync();

        return Ok("Kasa başarıyla açıldı.");
    }

    // POST: api/Muhasebe/MasrafEkle
    // Kasadan çıkan masrafları (fişsiz) kaydeder
    [HttpPost("MasrafEkle")]
    [Authorize(Roles = "Kasiyer, Yonetici")]
    public async Task<IActionResult> MasrafEkle([FromBody] MasrafDto dto)
    {
        var kasaHareketi = new KasaHareketi
        {
            KasiyerUserId = User.FindFirstValue(ClaimTypes.NameIdentifier),
            IslemTipi = "Masraf",
            Miktar = dto.Miktar * -1, // Çıkış olduğu için negatif
            Aciklama = dto.Aciklama
        };

        _context.KasaHareketleri.Add(kasaHareketi);
        await _context.SaveChangesAsync();

        return Ok("Masraf başarıyla kaydedildi.");
    }

    // GET: api/Muhasebe/GunSonuRaporu
    // Belirli bir tarihe veya vardiyaya ait tüm kasa hareketlerini ve net nakit durumunu hesaplar
    [HttpGet("GunSonuRaporu")]
    [Authorize(Roles = "Yonetici")]
    public async Task<ActionResult<GunSonuRaporuDto>> GetGunSonuRaporu([FromQuery] DateTime tarih)
    {
        var baslangic = tarih.Date;
        var bitis = tarih.Date.AddDays(1);

        var hareketler = await _context.KasaHareketleri
            .Where(h => h.Tarih >= baslangic && h.Tarih < bitis)
            .ToListAsync();

        // Basit Toplam Hesaplamaları
        var toplamNakitGiris = hareketler.Where(h => h.Miktar > 0).Sum(h => h.Miktar);
        var toplamNakitCikis = hareketler.Where(h => h.Miktar < 0).Sum(h => h.Miktar);

        // Sipariş yönetimi modülünden faydalanarak kart/online satışları da çekebiliriz.

        return Ok(new GunSonuRaporuDto
        {
            Tarih = tarih.Date,
            ToplamNakitGiris = toplamNakitGiris,
            ToplamNakitCikis = toplamNakitCikis,
            NetNakitBakiye = toplamNakitGiris + toplamNakitCikis,
            ToplamSatisSayisi = hareketler.Count(h => h.IslemTipi == "Satış"),
            Hareketler = hareketler
        });
    }

    // ... Kasa Kapanış metodu buraya eklenebilir.
}

// Data Transfer Object (DTO) - Masraf Girişi
public class MasrafDto
{
    public decimal Miktar { get; set; }
    public string Aciklama { get; set; }
}

// Data Transfer Object (DTO) - Gün Sonu Raporu
public class GunSonuRaporuDto
{
    public DateTime Tarih { get; set; }
    public decimal ToplamNakitGiris { get; set; }
    public decimal ToplamNakitCikis { get; set; }
    public decimal NetNakitBakiye { get; set; }
    public int ToplamSatisSayisi { get; set; }
    public List<KasaHareketi> Hareketler { get; set; }
}