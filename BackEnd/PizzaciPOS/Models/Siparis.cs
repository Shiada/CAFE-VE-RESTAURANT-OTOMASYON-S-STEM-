// Models/Siparis.cs

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using PizzaciPOS.Models;

namespace PizzaciPOS.Models
{
    public class Siparis
    {
        public int Id { get; set; } // Birincil Anahtar

        public DateTime SiparisTarihi { get; set; } = DateTime.Now;

        // Toplam tutar.
        [Column(TypeName = "decimal(18, 2)")]
        public decimal ToplamTutar { get; set; }

        public string? MusteriAdres { get; set; }
        public string? MusteriTelefon { get; set; }
        public string? OdemeSekli { get; set; } // Nakit, KK, Online

        // YENİ EKLENEN: Toplam Maliyet alanı
        [Column(TypeName = "decimal(18, 2)")]
        public decimal ToplamMaliyet { get; set; }

        // İlişki: Sipariş Detayları
        public List<SiparisDetay> Detaylar { get; set; } = new List<SiparisDetay>();

        // 🛑 DÜZELTME/SADELEŞTİRME: KuryeId, boş kalabilir.
        public string? KuryeId { get; set; }

        [Required]
        public string Durum { get; set; } = "Beklemede";

        // HATA DÜZELTME İÇİN KULLANILAN KISIM
        // Controller'da token'dan alınır, Migration'da zorunlu olmaması için [Required] kullanmıyoruz.
        public string? KasiyerId { get; set; } // Siparişi alan kullanıcının ID'si

        // 🟢 YENİ: Masa ve Müşteri İlişkileri
        public int? MasaId { get; set; }
        public Masa? Masa { get; set; }

        public int? MusteriId { get; set; }
        public Musteri? Musteri { get; set; }

        // İlişki (Navigation Property)
        [ForeignKey("KasiyerId")]
        public ApplicationUser? Kasiyer { get; set; }
    }
}