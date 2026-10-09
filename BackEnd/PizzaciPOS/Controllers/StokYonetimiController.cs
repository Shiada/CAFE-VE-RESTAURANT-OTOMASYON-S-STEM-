using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using PizzaciPOS.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PizzaciPOS.DTOs;
using PizzaciPOS;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Yonetici")] // Sadece Yöneticiler yetkilidir
public class StokYonetimiController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StokYonetimiController(ApplicationDbContext context)
    {
        _context = context;
    }

    // =======================================================
    // MALZEME (Hammadde) CRUD İŞLEMLERİ
    // =======================================================

    // GET: api/StokYonetimi/Malzemeler
    // Tüm malzemeleri listeleme
    [HttpGet("Malzemeler")]
    public async Task<ActionResult<IEnumerable<Malzeme>>> GetMalzemeler()
    {
        return await _context.Malzemeler.ToListAsync();
    }

    // GET: api/StokYonetimi/Malzeme/5
    // Tekil malzeme getirme
    [HttpGet("Malzeme/{id}")]
    public async Task<ActionResult<Malzeme>> GetMalzeme(int id)
    {
        var malzeme = await _context.Malzemeler.FindAsync(id);
        if (malzeme == null)
        {
            return NotFound();
        }
        return malzeme;
    }

    // POST: api/StokYonetimi/MalzemeEkle
    // Yeni malzeme ekleme (Genellikle ilk stok girişi ve maliyet burada tanımlanır)
    [HttpPost("MalzemeEkle")]
    public async Task<ActionResult<Malzeme>> PostMalzeme(Malzeme malzeme)
    {
        _context.Malzemeler.Add(malzeme);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMalzeme), new { id = malzeme.Id }, malzeme);
    }

    // PUT: api/StokYonetimi/Malzeme/5
    // Malzeme bilgilerini güncelleme (İsim, Birim, Kritik Seviye vb.)
    [HttpPut("Malzeme/{id}")]
    public async Task<IActionResult> PutMalzeme(int id, Malzeme malzeme)
    {
        if (id != malzeme.Id)
        {
            return BadRequest();
        }

        _context.Entry(malzeme).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Malzemeler.Any(e => e.Id == id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }
        return NoContent();
    }

    // DELETE: api/StokYonetimi/Malzeme/5
    // Malzeme silme (Dikkat: Reçetelerde kullanılıyorsa silinemeyebilir)
    [HttpDelete("Malzeme/{id}")]
    public async Task<IActionResult> DeleteMalzeme(int id)
    {
        var malzeme = await _context.Malzemeler.FindAsync(id);
        if (malzeme == null)
        {
            return NotFound();
        }

        _context.Malzemeler.Remove(malzeme);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // =======================================================
    // REÇETE (TARİF) CRUD İŞLEMLERİ
    // =======================================================

    // GET: api/StokYonetimi/Receteler/UrunCesit/10
    // Belirli bir ürün çeşidinin (Örn: Büyük Boy Pizza) tüm reçete detaylarını getirir
    [HttpGet("Receteler/UrunCesit/{urunCesitId}")]
    public async Task<ActionResult<IEnumerable<Recete>>> GetReceteler(int urunCesitId)
    {
        return await _context.Receteler
                             .Where(r => r.UrunCesitId == urunCesitId)
                             .Include(r => r.Malzeme) // Malzeme adını göstermek için
                             .ToListAsync();
    }

    // POST: api/StokYonetimi/ReceteEkle
    // Bir ürüne yeni bir malzeme ekler (Örn: Büyük Pizzaya 50gr Peynir ekle)
    [HttpPost("ReceteEkle")]
    public async Task<ActionResult<Recete>> PostRecete(Recete recete)
    {
        // Kontrol: Malzeme ID ve UrunCesit ID geçerli mi?
        var malzemeVarMi = await _context.Malzemeler.AnyAsync(m => m.Id == recete.MalzemeId);
        var urunCesitVarMi = await _context.UrunCesitleri.AnyAsync(uc => uc.Id == recete.UrunCesitId);

        if (!malzemeVarMi || !urunCesitVarMi)
        {
            return BadRequest("Geçersiz Malzeme veya Ürün Çeşit ID'si.");
        }

        _context.Receteler.Add(recete);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetReceteler), new { urunCesitId = recete.UrunCesitId }, recete);
    }

    // DELETE: api/StokYonetimi/Recete/1
    // Reçeteden bir malzemeyi silme (Örn: Pizzadan mantarı çıkarma)
    [HttpDelete("Recete/{id}")]
    public async Task<IActionResult> DeleteRecete(int id)
    {
        var recete = await _context.Receteler.FindAsync(id);
        if (recete == null)
        {
            return NotFound();
        }

        _context.Receteler.Remove(recete);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // =======================================================
    // EK: STOK HAREKETLERİ (Muhasebe/Giriş Çıkış)
    // =======================================================

    // POST: api/StokYonetimi/StokGiris
    // Stok miktarını artırma (Yeni malzeme alımı)
    [HttpPost("StokGiris")]
    public async Task<IActionResult> StokGiris([FromBody] StokHareketiDto model)
    {
        var malzeme = await _context.Malzemeler.FindAsync(model.MalzemeId);
        if (malzeme == null) return NotFound("Malzeme bulunamadı.");

        // Yeni birim maliyet hesaplaması (Weighted Average Cost - Ağırlıklı Ortalama Maliyet yapılabilir)
        // Ancak basitçe sadece stok miktarını güncelleyelim:
        malzeme.StokMiktari += model.Miktar;
        malzeme.SonBirimMaliyet = model.BirimMaliyet; // Yeni birim maliyeti kaydedelim

        _context.Entry(malzeme).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return Ok($"Stok güncellendi. Yeni miktar: {malzeme.StokMiktari}");
    }
}

// Data Transfer Object (DTO) - Stok Girişi İçin
public class StokHareketiDto
{
    public int MalzemeId { get; set; }
    public decimal Miktar { get; set; }
    public decimal BirimMaliyet { get; set; }
}