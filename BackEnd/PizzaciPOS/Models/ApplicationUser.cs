// Models/ApplicationUser.cs
using Microsoft.AspNetCore.Identity;

// Pizzacı sistemindeki kullanıcıları temsil eder (Kasiyer, Yönetici, Kurye)
public class ApplicationUser : IdentityUser
{
    // IdentityUser sınıfı zaten Id, UserName, Email, PasswordHash vb. içerir.

    // Ek alanlar ekleyebiliriz:
    public string AdSoyad { get; set; }
    public DateTime DogumTarihi { get; set; }
}

// Models/ApplicationRole.cs (Standart Identity Rol yapısını kullanabiliriz)
// Rolleri tanımlar: Yönetici, Kasiyer, Kurye
