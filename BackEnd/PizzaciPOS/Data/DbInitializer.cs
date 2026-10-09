using Microsoft.AspNetCore.Identity;
using PizzaciPOS.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;

namespace PizzaciPOS
{
    public static class DbInitializer
    {
        public static async Task Initialize(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            // 1. Rolleri Oluşturma
            string[] roleNames = { "Yonetici", "Kasiyer", "Kurye" };
            foreach (var roleName in roleNames)
            {
                if (await roleManager.FindByNameAsync(roleName) == null)
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            // 2. Yönetici (Admin) Kullanıcısını Oluşturma / Güncelleme
            var adminUser = await userManager.FindByNameAsync("admin");
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = "admin",
                    AdSoyad = "Sistem Yöneticisi",
                    DogumTarihi = DateTime.Now,
                    EmailConfirmed = true
                };
                await userManager.CreateAsync(adminUser, "Admin123!");
            }
            else 
            {
                var token = await userManager.GeneratePasswordResetTokenAsync(adminUser);
                await userManager.ResetPasswordAsync(adminUser, token, "Admin123!");
            }
            
            if (!await userManager.IsInRoleAsync(adminUser, "Yonetici"))
            {
                await userManager.AddToRoleAsync(adminUser, "Yonetici");
            }

            // 3. Kasiyer Kullanıcısını Oluşturma / Güncelleme
            var kasiyerUser = await userManager.FindByNameAsync("kasiyer");
            if (kasiyerUser == null)
            {
                kasiyerUser = new ApplicationUser
                {
                    UserName = "kasiyer",
                    AdSoyad = "Ana Kasiyer",
                    DogumTarihi = DateTime.Now,
                    EmailConfirmed = true
                };
                await userManager.CreateAsync(kasiyerUser, "Kasiyer123!");
            }
            else 
            {
                var token = await userManager.GeneratePasswordResetTokenAsync(kasiyerUser);
                await userManager.ResetPasswordAsync(kasiyerUser, token, "Kasiyer123!");
            }

            if (!await userManager.IsInRoleAsync(kasiyerUser, "Kasiyer"))
            {
                await userManager.AddToRoleAsync(kasiyerUser, "Kasiyer");
            }
        }
    }
}