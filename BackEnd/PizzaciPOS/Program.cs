using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using System.Globalization;
using System.Text.Json.Serialization;
using System.Security.Claims;
using PizzaciPOS.Models;
using PizzaciPOS;
using Microsoft.Extensions.DependencyInjection;

var cultureInfo = new CultureInfo("en-US");
CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;

var builder = WebApplication.CreateBuilder(args);

// 1. Veritabanı Kaydı (Retry Strategy ve Hassas Log Aktif)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
              ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions => sqlOptions.EnableRetryOnFailure())
    .EnableSensitiveDataLogging()
);

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
  .AddEntityFrameworkStores<ApplicationDbContext>()
  .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]!)),
        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.Name
    };
});

builder.Services.AddCors(options => {
    options.AddPolicy("AllowSpecificOrigin", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers().AddJsonOptions(options => {
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 🛑 Otomatik Veritabanı Hazırlama (Kategoriler ve Kullanıcılar)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    
    context.Database.Migrate();

    // DbInitializer'ı asenkron olarak çağırıyoruz
    DbInitializer.Initialize(userManager, roleManager).Wait();

    // 🛑 TABLO OLUŞTURMA VE SEED (Migration aracı olmayan durumlar için)
    try {
        // 🏨 MASALAR TABLOSU (Zorunlu)
        context.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Masalar')
            CREATE TABLE Masalar (
                Id INT PRIMARY KEY IDENTITY(1,1),
                MasaAdi NVARCHAR(50) NOT NULL,
                Durum NVARCHAR(MAX) NOT NULL,
                AktifSiparisId INT NULL,
                MasaTutari DECIMAL(18,2) NOT NULL,
                Kapasite INT NOT NULL,
                Konum NVARCHAR(MAX) NOT NULL
            )
        ");

        // 🛠 EKSİK KOLONLARI EKLE (Siparisler)
        context.Database.ExecuteSqlRaw(@"
            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Siparisler')
            BEGIN
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Siparisler') AND name = 'MasaId')
                    ALTER TABLE Siparisler ADD MasaId INT NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Siparisler') AND name = 'MusteriId')
                    ALTER TABLE Siparisler ADD MusteriId INT NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Siparisler') AND name = 'ToplamMaliyet')
                    ALTER TABLE Siparisler ADD ToplamMaliyet DECIMAL(18,2) NOT NULL DEFAULT 0;
            END
        ");

        // 🛠 EKSİK KOLONLARI EKLE (SiparisDetaylari)
        context.Database.ExecuteSqlRaw(@"
            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'SiparisDetaylari')
            BEGIN
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SiparisDetaylari') AND name = 'BirimMaliyet')
                    ALTER TABLE SiparisDetaylari ADD BirimMaliyet DECIMAL(18,2) NOT NULL DEFAULT 0;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SiparisDetaylari') AND name = 'AraToplam')
                    ALTER TABLE SiparisDetaylari ADD AraToplam DECIMAL(18,2) NOT NULL DEFAULT 0;
            END
        ");

        if (!context.Masalar.Any())
        {
            context.Masalar.AddRange(
                new Masa { MasaAdi = "Masa 1", Durum = "Bos", Konum = "Salon", Kapasite = 4 },
                new Masa { MasaAdi = "Masa 2", Durum = "Bos", Konum = "Salon", Kapasite = 4 },
                new Masa { MasaAdi = "Teras 1", Durum = "Bos", Konum = "Teras", Kapasite = 2 },
                new Masa { MasaAdi = "Bahce 1", Durum = "Bos", Konum = "Bahce", Kapasite = 6 }
            );
            context.SaveChanges();
        }

        // 👨‍💼 MÜŞTERİLER TABLOSU OLUŞTURMA
        context.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Musteriler')
            CREATE TABLE Musteriler (
                Id INT PRIMARY KEY IDENTITY(1,1),
                Isim NVARCHAR(100) NOT NULL,
                Telefon NVARCHAR(20) NOT NULL,
                Email NVARCHAR(MAX) NULL,
                Adres NVARCHAR(MAX) NULL,
                Puan DECIMAL(18,2) NOT NULL DEFAULT 0,
                KayitTarihi DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                SonSiparisTarihi DATETIME2 NULL,
                ToplamHarcama DECIMAL(18,2) NOT NULL DEFAULT 0
            )
        ");

        if (!context.Musteriler.Any())
        {
            context.Musteriler.Add(new Musteri { Isim = "VIP Test Müşteri", Telefon = "05001234567", Puan = 100, ToplamHarcama = 2000 });
            context.SaveChanges();
        }

        // 🧠 REÇETELER TABLOSU OLUŞTURMA
        context.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Receteler')
            CREATE TABLE Receteler (
                Id INT PRIMARY KEY IDENTITY(1,1),
                UrunCesitId INT NOT NULL,
                MalzemeId INT NOT NULL,
                KullanilanMiktar DECIMAL(18,4) NOT NULL
            )
        ");

    } catch (Exception ex) { Console.WriteLine("Tablo/Kolon Oluşturma Hatası: " + ex.Message); }

    if (!context.Kategoriler.Any())
    {
        context.Kategoriler.AddRange(
            new Kategori { Ad = "Pizzalar" },
            new Kategori { Ad = "İçecekler" },
            new Kategori { Ad = "Tatlılar" }
        );
        context.SaveChanges();
    }
}

if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseCors("AllowSpecificOrigin");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();