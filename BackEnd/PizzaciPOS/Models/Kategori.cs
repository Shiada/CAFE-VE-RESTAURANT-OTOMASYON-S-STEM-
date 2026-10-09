// Models/Kategori.cs
public class Kategori
{
    public int Id { get; set; }
    public string Ad { get; set; } // Örn: Pizza, İçecekler, Ek Malzemeler
    public List<Urun> Urunler { get; set; } // İlişki: Bir kategorinin birden fazla ürünü vardır
    
}