// Models/Urun.cs
public class Urun
{
    public int Id { get; set; }
    public string Isim { get; set; }
    public string Aciklama { get; set; }
    public decimal VarsayilanFiyat { get; set; }

    // İlişki: Hangi kategoriye ait?
    public int KategoriId { get; set; }
    public Kategori Kategori { get; set; }

    // Stok takibi için temel seviye:
    public bool StoktaVarMi { get; set; } = true;

    // Bir ürünün birden fazla boyutu/çeşidi olabilir.
    public List<UrunCesit> Cesitler { get; set; }
}