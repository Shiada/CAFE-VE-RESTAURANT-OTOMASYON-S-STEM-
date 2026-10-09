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
    public class ReceteYonetimiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReceteYonetimiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("Receteler")]
        public async Task<ActionResult<IEnumerable<Recete>>> GetReceteler()
        {
            return await _context.Receteler
                .Include(r => r.UrunCesit).ThenInclude(uc => uc.Urun)
                .Include(r => r.Malzeme)
                .ToListAsync();
        }

        [HttpPost("ReceteEkle")]
        public async Task<ActionResult<Recete>> ReceteEkle(Recete recete)
        {
            _context.Receteler.Add(recete);
            await _context.SaveChangesAsync();
            return Ok(recete);
        }

        [HttpDelete("ReceteSil/{id}")]
        public async Task<IActionResult> ReceteSil(int id)
        {
            var recete = await _context.Receteler.FindAsync(id);
            if (recete == null) return NotFound();

            _context.Receteler.Remove(recete);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
