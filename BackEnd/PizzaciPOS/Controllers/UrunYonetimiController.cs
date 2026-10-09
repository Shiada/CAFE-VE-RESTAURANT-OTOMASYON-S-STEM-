using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using PizzaciPOS.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using PizzaciPOS.DTOs;
using System.Collections.Generic;
using System.Globalization;
using PizzaciPOS;
using Microsoft.Extensions.DependencyInjection;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Yonetici")]
public class UrunYonetimiController : ControllerBase
{
    private readonly IServiceScopeFactory _scopeFactory;

    public UrunYonetimiController(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    [HttpGet("Kategoriler")]
    public async Task<ActionResult<IEnumerable<Kategori>>> GetKategoriler()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        return await context.Kategoriler.AsNoTracking().ToListAsync();
    }

    [HttpGet("Urunler")]
    public async Task<ActionResult<IEnumerable<UrunListDto>>> GetUrunler()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var urunler = await context.Urunler
            .Include(u => u.Kategori)
            .Include(u => u.Cesitler)
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);

        var urunDtoListesi = urunler.Select(u => new UrunListDto
        {
            Id = u.Id,
            Isim = u.Isim,
            Aciklama = u.Aciklama,
            VarsayilanFiyat = u.VarsayilanFiyat,
            StoktaVarMi = u.StoktaVarMi,
            KategoriId = u.KategoriId,
            KategoriAdi = u.Kategori?.Ad ?? "Tanımsız Kategori",
            Cesitler = u.Cesitler.Select(c => new UrunCesitDto
            {
                Id = c.Id,
                CesitAdi = c.CesitAdi,
                EkFiyat = c.EkFiyat
            }).ToList()
        }).ToList();

        return Ok(urunDtoListesi);
    }

    [HttpPost("UrunEkle")]
    public async Task<IActionResult> UrunEkle([FromBody] UrunEkleRequest request)
    {
        if (request == null) return BadRequest("İstek gövdesi boş olamaz.");

        decimal varsayilanFiyat;
        if (!decimal.TryParse(request.Fiyat.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out varsayilanFiyat))
        {
            return BadRequest(new { Message = "Fiyat formatı hatalı. Nokta (.) kullanın." });
        }

        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            // 🛑 KRİTİK: İşlemi arka planda izole ederek NetworkStream hatasını önlüyoruz
            var result = await Task.Run(async () =>
            {
                using var scope = _scopeFactory.CreateScope();
                var scopedContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                // 🛑 KRİTİK: Loglarda görülen Strateji hatasını çözmek için strategy kullanıyoruz
                var strategy = scopedContext.Database.CreateExecutionStrategy();

                return await strategy.ExecuteAsync(async () =>
                {
                    using (var transaction = await scopedContext.Database.BeginTransactionAsync().ConfigureAwait(false))
                    {
                        try
                        {
                            var kategori = await scopedContext.Kategoriler
                                .AsNoTracking()
                                .FirstOrDefaultAsync(k => k.Id == request.KategoriId)
                                .ConfigureAwait(false);

                            if (kategori == null) return null;

                            string cleanIsim = request.Isim?.Replace(" ", "") ?? "URUN";
                            string skuPrefix = cleanIsim.Length > 4 ? cleanIsim.Substring(0, 4) : cleanIsim;
                            string uniqueGuid = Guid.NewGuid().ToString().Substring(0, 5);

                            var yeniUrun = new Urun
                            {
                                Isim = request.Isim ?? string.Empty,
                                Aciklama = request.Aciklama ?? string.Empty,
                                VarsayilanFiyat = varsayilanFiyat,
                                StoktaVarMi = true,
                                KategoriId = request.KategoriId,
                                Cesitler = new List<UrunCesit>
                                {
                                    new UrunCesit
                                    {
                                        CesitAdi = "Standart",
                                        EkFiyat = 0.00m,
                                        SKU = $"{skuPrefix.ToUpper()}_STD_{kategori.Id}_{uniqueGuid}"
                                    }
                                }
                            };

                            scopedContext.Urunler.Add(yeniUrun);
                            await scopedContext.SaveChangesAsync().ConfigureAwait(false);
                            await transaction.CommitAsync().ConfigureAwait(false);

                            return new { Id = yeniUrun.Id, Isim = yeniUrun.Isim };
                        }
                        catch
                        {
                            await transaction.RollbackAsync().ConfigureAwait(false);
                            throw;
                        }
                    }
                });
            });

            if (result == null)
                return BadRequest(new { Message = $"Kategori ID {request.KategoriId} bulunamadı." });

            return Ok(new
            {
                Message = "Ürün başarıyla eklendi.",
                UrunId = result.Id,
                UrunIsim = result.Isim
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Sunucu hatası!", Detail = ex.Message });
        }
    }
}