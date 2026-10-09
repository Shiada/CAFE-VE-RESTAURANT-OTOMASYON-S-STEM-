// Model/LoginModel.cs
public class LoginModel
{
    public string KullaniciAdi { get; set; }
    public string Sifre { get; set; }
}

// Model/ChangePasswordModel.cs
public class ChangePasswordModel
{
    public string MevcutSifre { get; set; }
    public string YeniSifre { get; set; }
}

// NOT: Register (Kayıt) uç noktası, POS sistemlerinde genellikle sadece yöneticiler 
// tarafından yönetici paneli üzerinden yapıldığı için bu versiyona eklenmemiştir.