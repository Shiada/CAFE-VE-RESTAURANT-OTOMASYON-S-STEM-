using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PizzaciPOS.Models;
using PizzaciPOS;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PizzaciPOS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MasaYonetimiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MasaYonetimiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("Masalar")]
        public async Task<ActionResult<IEnumerable<Masa>>> GetMasalar()
        {
            return await _context.Masalar.ToListAsync();
        }

        [HttpPost("MasaDurumGuncelle")]
        public async Task<IActionResult> MasaDurumGuncelle(int id, string yeniDurum)
        {
            var masa = await _context.Masalar.FindAsync(id);
            if (masa == null) return NotFound("Masa bulunamadı.");

            masa.Durum = yeniDurum;
            await _context.SaveChangesAsync();
            return Ok(masa);
        }

        [HttpPost("MasaEkle")]
        public async Task<ActionResult<Masa>> MasaEkle(Masa masa)
        {
            _context.Masalar.Add(masa);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMasalar), new { id = masa.Id }, masa);
        }
    }
}
