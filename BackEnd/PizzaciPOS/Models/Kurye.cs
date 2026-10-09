// Models/Kurye.cs
using System.ComponentModel.DataAnnotations;

namespace PizzaciPOS.Models
{
    // Kuryeye özel ek bilgileri tutar
    public class KuryeBilgisi
    {
        public int Id { get; set; }

        // İlişki: Kurye, ApplicationUser tablosundaki bir kullanıcıdır.
        public string ApplicationUserId { get; set; }

        public string AracTipi { get; set; } // Örn: Motor, Bisiklet, Araba
        public bool MusaitMi { get; set; } = true; // Şu an sipariş alabilir mi?
        public string SonKonum { get; set; } // GPS verisi (basit string olarak)
    }
}