# İlk Copernicus Marine SST entegrasyonu

2025 yılına ait 12 C3S / DMI SST kaynağı entegre edildi. Güncel sonuç ve sınırlamalar: [2025 SST entegrasyon raporu](SST_2025_INTEGRATION.md). Aşağıdaki kontrol listesi gelecekteki kaynaklar için korunmuştur:

1. Dosyayı değiştirmeden sakla; adını, boyutunu, SHA-256 değerini, ürün/sürüm, indirme tarihi ve lisansı kaydet. Bilinmeyen bilgiyi başka üründen varsayma.
2. Biçimi, boyutları, değişkenleri, koordinatları ve birimleri incele. NetCDF için ayrı Python ortamına `tools/requirements-science.txt` kurulabilir; `python tools/inspect_sst.py <dosya> --output <envanter.json>` salt okunur başlangıç aracıdır. Veri entegre etmez ve otomatik SST seçmez.
3. SST'nin gerçek tanımını (skin/foundation/derinlik), gözlem veya model ürünü oluşunu, ortalama süresini, kalite ve belirsizlik değişkenlerini ürün dokümantasyonuyla doğrula.
4. CRS, longitude düzeni, 1D/2D grid, hücre sınırları, zaman birimi, takvim ve UTC dönüşümünü denetle. Desteklenmeyen takvim veya projeksiyon açık bir bağdaştırıcı gerektirir.
5. `_FillValue`, `missing_value`, kaynak aralıkları, `scale_factor`, `add_offset` ve kalite bayraklarını incele. Eksik/geçersiz kayıtları say; eksikleri sıfırla doldurma. Dönüşümleri ve birimleri kaydet; paket çözme işlemini iki kez uygulama.
6. NASA verileriyle gerçek alan/zaman kesişimini değerlendir. Mevcut dört sabitin kesin yılları/alanı eksik olduğundan şu an uyumluluk sonucu “bilinmiyor” olacaktır. Ham NASA verisi veya güvenilir kapsam künyesi olmadan eşleştirme iddiasında bulunma.
7. Gerçek değişken/kalite kurallarına göre dosyaya özgü normalize paket veya büyük gridler için raster/karo bağdaştırıcısı ekle. Kaynak özeti, birim, çözünürlük ve dönüşüm geçmişini koru.
8. Haritada seçilen zaman/değişkende gerçek ölçümleri göster. Null hücreleri çizme, sayılarını raporla. Kaynak dosyadan gerçek hücrelerin koordinat/değer/birim/zamanını ekranla karşılaştır. Ölçülmemiş bölgelere renk/tahmin yayma; sınır aşımında sessiz örnekleme yapma.
9. Bilimsel model kullanımını ayrıca değerlendir. SST tek başına habitat veya çarpışma olasılığı değildir. *Eubalaena glacialis* için diğer girdilerle birlikte kullanım ancak uygun eşleştirme, yöntem, parametre ve doğrulama sağlandığında açılır. Diğer türler ayrı gereksinimlerle ele alınır.
10. Gerçek dosyaya ait kayıt/eksik sayıları, kapsam, zaman, birim, kalite filtresi ve seçilmiş hücreleri test et. Eski 64 kaynak karşılaştırmasını koru. Çalışan entegrasyonu ve kalan sınırları raporla.

Dosyayı önceden yeniden biçimlendirmen gerekmez. Özgün dosya ve varsa ürün kimliği/indirme künyesi yeterlidir.
