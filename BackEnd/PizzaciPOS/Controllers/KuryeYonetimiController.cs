using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using PizzaciPOS.Models;
using System.Linq;
using System.Security.Claims;
using PizzaciPOS;
[ApiController]
[Route("api/[controller]")]
public class KuryeYonetimiController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public KuryeYonetimiController(ApplicationDbContext context)
    {
        _context = context;
    }

    // =======================================================
    // YÖNETİCİ/KASİYER İŞLEMLERİ
    // =======================================================

    // GET: api/KuryeYonetimi/MusaitKuryeler
    // Müsait kuryeleri listeler (Yönetici/Kasiyer, Atama için)
    [HttpGet("MusaitKuryeler")]
    [Authorize(Roles = "Yonetici, Kasiyer")]
    public async Task<ActionResult<IEnumerable<KuryeBilgisi>>> GetMusaitKuryeler()
    {
        return await _context.KuryeBilgileri
                             .Where(k => k.MusaitMi == true)
                             .ToListAsync();
    }

    // POST: api/KuryeYonetimi/KuryeAta
    // Siparişi kuryeye atar (Yönetici/Kasiyer)
    [HttpPost("KuryeAta")]
    [Authorize(Roles = "Yonetici, Kasiyer")]
    public async Task<IActionResult> KuryeAta([FromBody] KuryeAtamaDto dto)
    {
        // 1. Siparişin ve Kuryenin varlığını kontrol et
        var siparis = await _context.Siparisler.FindAsync(dto.SiparisId);
        var kuryeBilgi = await _context.KuryeBilgileri.FirstOrDefaultAsync(k => k.ApplicationUserId == dto.KuryeUserId);

        if (siparis == null || kuryeBilgi == null || !kuryeBilgi.MusaitMi)
        {
            return BadRequest("Sipariş veya müsait kurye bulunamadı.");
        }

        // 2. Teslimat kaydını oluştur
        var teslimat = new Teslimat
        {
            SiparisId = siparis.Id,
            KuryeUserId = kuryeBilgi.ApplicationUserId,
            TeslimatUcreti = 15.00m, // Basit örnek
            AtanmaZamani = DateTime.Now
        };

        siparis.Durum = "Yolda";
        kuryeBilgi.MusaitMi = false; // Kuryeyi meşgul et

        _context.Teslimatlar.Add(teslimat);
        _context.Siparisler.Update(siparis);
        _context.KuryeBilgileri.Update(kuryeBilgi);

        await _context.SaveChangesAsync();

        return Ok($"Sipariş {kuryeBilgi.ApplicationUserId} ID'li kuryeye atandı.");
    }

    // =======================================================
    // KURYE İŞLEMLERİ
    // =======================================================

    // GET: api/KuryeYonetimi/MevcutSiparisler
    // Kuryenin teslim etmesi gereken siparişleri listeler (Kurye)
    [HttpGet("MevcutSiparisler")]
    [Authorize(Roles = "Kurye")]
    public async Task<ActionResult<IEnumerable<Teslimat>>> GetKuryeSiparisleri()
    {
        // Token'dan kurye ID'sini al
        var kuryeUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return await _context.Teslimatlar
                             .Where(t => t.KuryeUserId == kuryeUserId && t.TeslimZamani == null)
                             .Include(t => t.Siparis)
                             .ToListAsync();
    }

    // POST: api/KuryeYonetimi/TeslimEdildi/123
    // Teslimatın durumunu 'Teslim Edildi' olarak günceller (Kurye)
    [HttpPost("TeslimEdildi/{siparisId}")]
    [Authorize(Roles = "Kurye")]
    public async Task<IActionResult> TeslimEdildi(int siparisId)
    {
        var teslimat = await _context.Teslimatlar
                                     .FirstOrDefaultAsync(t => t.SiparisId == siparisId && t.TeslimZamani == null);

        if (teslimat == null) return NotFound("Aktif teslimat bulunamadı.");

        var kuryeBilgi = await _context.KuryeBilgileri.FirstOrDefaultAsync(k => k.ApplicationUserId == teslimat.KuryeUserId);
        var siparis = await _context.Siparisler.FindAsync(siparisId);

        if (kuryeBilgi == null || siparis == null) return BadRequest();

        // Verileri güncelle
        teslimat.TeslimZamani = DateTime.Now;
        siparis.Durum = "Teslim Edildi";
        kuryeBilgi.MusaitMi = true; // Kuryeyi tekrar müsait yap

        _context.Teslimatlar.Update(teslimat);
        _context.Siparisler.Update(siparis);
        _context.KuryeBilgileri.Update(kuryeBilgi);

        await _context.SaveChangesAsync();

        return Ok("Teslimat tamamlandı. Kurye müsait hale getirildi.");
    }
}

// Data Transfer Object (DTO) - Kurye Atama İçin
public class KuryeAtamaDto
{
    public int SiparisId { get; set; }
    public string KuryeUserId { get; set; }
}