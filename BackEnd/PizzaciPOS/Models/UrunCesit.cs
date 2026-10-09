// Models/UrunCesit.cs
public class UrunCesit
{
    public int Id { get; set; }
    public int UrunId { get; set; }
    public Urun? Urun { get; set; }

    public string CesitAdi { get; set; } = string.Empty; // Örn: Küçük, Orta, Büyük, İnce Hamur
    public decimal EkFiyat { get; set; } // Varsayılan fiyata eklenen fiyat farkı
    public string? SKU { get; set; } // Stok Tutma Birimi (Muhasebe için önemlidir)
}