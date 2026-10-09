using System.Collections.Generic;

namespace PizzaciPOS.DTOs
{
    // Ürün Yönetimi ve POS listeleri için sadece gerekli bilgileri döndürür
    public class UrunListDto
    {
        public int Id { get; set; }
        public string Isim { get; set; }
        public string Aciklama { get; set; }
        public decimal VarsayilanFiyat { get; set; }
        public bool StoktaVarMi { get; set; }

        public int KategoriId { get; set; }
        public string KategoriAdi { get; set; }

        // İlişki Döngüsünü Kırdık: Çeşit DTO'larını kullanıyoruz
        public List<UrunCesitDto> Cesitler { get; set; }
    }
}