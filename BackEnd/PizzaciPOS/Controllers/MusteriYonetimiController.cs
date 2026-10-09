using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PizzaciPOS.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PizzaciPOS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MusteriYonetimiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MusteriYonetimiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("Musteriler")]
        public async Task<ActionResult<IEnumerable<Musteri>>> GetMusteriler()
        {
            return await _context.Musteriler.OrderByDescending(m => m.KayitTarihi).ToListAsync();
        }

        [HttpGet("MusteriSorgula")]
        public async Task<ActionResult<Musteri>> MusteriSorgula([FromQuery] string telefon)
        {
            var musteri = await _context.Musteriler.FirstOrDefaultAsync(m => m.Telefon == telefon);
            if (musteri == null) return NotFound("Müşteri bulunamadı.");
            return Ok(musteri);
        }

        [HttpPost("MusteriEkle")]
        public async Task<ActionResult<Musteri>> MusteriEkle(Musteri musteri)
        {
            // Telefon numarasına göre mükerrer kayıt kontrolü
            if (await _context.Musteriler.AnyAsync(m => m.Telefon == musteri.Telefon))
            {
                return BadRequest("Bu telefon numarasına ait bir müşteri zaten var.");
            }

            _context.Musteriler.Add(musteri);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMusteriler), new { id = musteri.Id }, musteri);
        }

        [HttpPut("MusteriGuncelle/{id}")]
        public async Task<IActionResult> MusteriGuncelle(int id, Musteri musteri)
        {
            if (id != musteri.Id) return BadRequest();
            _context.Entry(musteri).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
