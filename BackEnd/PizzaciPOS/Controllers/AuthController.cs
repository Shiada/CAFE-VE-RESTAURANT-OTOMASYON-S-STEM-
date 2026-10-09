// Controllers/AuthController.cs

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using PizzaciPOS;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    // =======================================================
    // 1. GİRİŞ YAPMA (Login)
    // =======================================================
    // POST: api/Auth/login (JWT Token Üretir)
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var user = await _userManager.FindByNameAsync(model.KullaniciAdi);

        if (user != null && await _userManager.CheckPasswordAsync(user, model.Sifre))
        {
            var userRoles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName!),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var userRole in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, userRole)); // ASP.NET Core Authorize attribute için
                claims.Add(new Claim("role", userRole));        // Frontend (jwt-decode) için
            }

            var token = GetToken(claims);

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo
            });
        }
        return Unauthorized(new { Message = "Kullanıcı adı veya şifre hatalı." });
    }

    // =======================================================
    // 2. ŞİFRE DEĞİŞTİRME (ChangePassword)
    // =======================================================
    // Bu, halihazırda giriş yapmış bir kullanıcının şifresini değiştirmesine olanak tanır.
    [HttpPost("change-password")]
    [Microsoft.AspNetCore.Authorization.Authorize] // Giriş yapmış olmayı zorunlu kılar
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
    {
        // Token'dan kullanıcının ID'sini al
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        var result = await _userManager.ChangePasswordAsync(user, model.MevcutSifre, model.YeniSifre);

        if (!result.Succeeded)
        {
            return BadRequest(new { Message = "Şifre değiştirme başarısız.", Errors = result.Errors });
        }

        return Ok(new { Message = "Şifre başarıyla güncellendi." });
    }

    // =======================================================
    // PRIVATE METOTLAR
    // =======================================================
    private JwtSecurityToken GetToken(List<Claim> authClaims)
    {
        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]!));

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            expires: DateTime.Now.AddHours(3), // Token ömrü 3 saat
            claims: authClaims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        );
        return token;
    }

    // NOT: PostInitialUsers metodu güvenlik nedeniyle bu sürümden tamamen KALDIRILMIŞTIR.
}