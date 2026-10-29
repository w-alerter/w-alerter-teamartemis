# W-ALERTER 2.0 — Sistem incelemesi ve altyapı

Bu sürüm yeni bilimsel sonuç üretmez. Mevcut hesapları korur; gerçek verilerin aşamalı kabulü, kaynak takibi, harita katmanları ve ayrı model bağlantıları için temel sağlar.

## Gerçekte çalışan özellikler

| Bileşen | Durum |
| --- | --- |
| Klasik konum analizi | Kullanıcı ölçümünü dört aylık klorofil-a referansıyla karşılaştırır. Sayısal kurallar aynıdır. |
| Klasik rota | Sıralı noktalar, Haversine mesafesi ve varış noktasına bağlı mevcut risk sınıflaması. |
| Kayıt ve dışa aktarım | Mevcut taslak, rota ve kullanıcı ölçümleri; JSON, GPX, gözlem CSV'si, çevrimdışı HTML raporu. |
| Haritalar | C3S SST, iki bölgedeki CMEMS akıntı rasterleri/yönleri ve yerel balina araştırma katmanı. Altlıklar bilimsel ölçüm sayılmaz. Dış altlık servisine bağlıdır. |
| Veri kabulü altyapısı | Metadata içeren normalize JSON paketleri için teknik ön kontrol, inceleme sonrası yerel kayıt, dosya yedeği ve zaman/değişken seçimiyle kaynak ölçümü çizimi. Sağlanan gerçek SST, akıntı ve DwC-A dosyalarıyla test edilmiştir. |
| Dil/tasarım | TR/EN/DE/FR/ES; tüm ekranlarda ana sayfanın okyanus, kırık beyaz ve açık yeşil dili. Orijinal logo beyaz kağıt zemini olmadan kullanılır. |
| HYDRA | 16 yönlü A* kaynak kodu depoda ve verilen HTML'de bulunamadı. Yeni A* yazılmadı; mevcut sıralı motor HYDRA olarak adlandırılmadı. |

## Kaynak ve hesap denetimi

Kaynak HTML, Horseshoe Adası / Antarktika bağlamında NASA MODIS-Aqua atfı içerir. Depoda yalnızca dört aylık sabit vardır:

| Ay | Klorofil-a (mg/m³) |
| --- | ---: |
| Ekim | 0.4091 |
| Kasım | 0.3253 |
| Aralık | 0.3481 |
| Ocak | 0.3303 |

Ham MODIS dosyası, ürün kimliği/sürümü, kesin yıllar, alan, özgün çözünürlük ve lisans sağlanmamıştır. Kaynaktaki “23 yıl” iddiası dosyalarla doğrulanamadığından doğrulanmış kapsam olarak sunulmaz. Dört sabit Kuzey Atlantik alanına taşınmaz, balina konumu veya uydu ölçüm alanı olarak çizilmez. Kaynak HTML'nin SHA-256 özeti saklanır; bu ham NASA ürününün özeti değildir.

`dist/model.js` ve `dist/workspace.js` bayt düzeyinde korunmuştur:

```
model.js     631436312232a6c98413bd0d3d477ca7738ba144cb0811ce266ffd5f6d0c1e6b
workspace.js 537120a60aa080044dfbc875721cf93668516b050991ebfd1c45fd77f07b528e
```

Oran = ölçüm / aylık referans. Normal < 1.25; orta ≥ 1.25; kritik ≥ 1.8. Gösterge: oran × 50, en çok 99.8; oran < 0.5 ise oran × 18. Bu gösterge doğrulanmış tür olasılığı değildir.

Mesafe: Haversine, R = 3440 NM. Varış noktası oranı ≥ 1.25 olan etabın tamamı eski riskli mesafeye eklenir. Eski `riskDist × 2.5` sonucu ile 10 knot / %28.5 sabitleri korunur; gemiye özgü yakıt veya CO₂ hesabı olarak sunulmaz.

## Modüller ve veri akışı

| Dosya | Sorumluluk |
| --- | --- |
| `dist/science/catalog.mjs` | Planlanan veri türleri, dört ayrı tür, dokuz rota bileşeni, mevcut referans künyesi. Bildirim, entegrasyon değildir. |
| `validation.mjs` | Metadata, UTC, koordinat/bbox, değer türü, kaynak aralığı, null, geometri ve kapsam kontrolü. Eksik alan/zaman için uyumluluk `unknown`. |
| `pipeline.mjs` | Dosya sınırları, biçim ayrımı, ön kontrol, SHA-256. NetCDF/HDF/CSV/yalın GeoJSON bağdaştırıcı bekler. |
| `repository.mjs` | Ayrı IndexedDB; metadata dizini, tam paket, özgün normalize dosya atomik saklanır. Aynı kimlik veya dosya üzerine yazılmaz. |
| `models.mjs` | Tür/motor/maliyet kayıt arayüzleri. Belgesiz yöntem reddedilir; yetersiz veri veya yöntemde `blocked`, `result:null`. |
| `layers.mjs` | Seçilen zaman ve değişkenin kaynak değerleri; null değerler çizilmez, sayılır. Tahmin veya enterpolasyon yoktur. |
| `ui.mjs` | TR/EN/DE/FR/ES katalog, kaynak künyesi, dosya inceleme, kayıt, harita ve hazırlık durumları. |
| `dataset.schema.json` | Normalize paket sözleşmesi; semantik kontroller ayrıca uygulamada yapılır. |
| `tools/inspect_sst.py` | Tek NetCDF dosyasının salt okunur envanteri; SST dönüştürücüsü değildir. |
| `tools/preprocess_sst.py` | 12 gerçek C3S/DMI kaynağının denetimi, kayıpsız bölgesel sorgu parçaları ve açıkça örneklenmiş harita görselleri. |
| `dist/environment/` | Ortak Environmental Data Repository / Service, özgün hücre sorguları, tarih ve kalite yönetimi, Mercator harita gösterimi. |

Akış: özgün kaynak → dosyaya özgü bağdaştırıcı → normalize paket ve dönüşüm geçmişi → teknik kontrol → kullanıcı incelemesi → ayrı depo → kaynak ölçümü haritası. Bilimsel model kullanımı ayrıca yöntem ve veri uygunluğu incelemesi ister. Dosyanın kendi “onay” alanı bilimsel onay sayılmaz.

Paket; kurum, ürün/sürüm, bağlantı, atıf, lisans, zaman/takvim, bbox/CRS, çözünürlük, değişken/birim, takson, beyan edilen kaynak dosya SHA-256 ve dönüşümleri saklar. İçe alınan normalize dosyanın SHA-256 değeri ayrıca hesaplanır. Ham kaynak özeti, ham kaynak sağlandığında ayrıca doğrulanmalıdır. Bilinmeyen isteğe bağlı metadata `null`; eksik ölçüm de açıkça `null` olur. Sayısal metin, tanımsız eksik değer veya geçersiz kayıt sessizce dönüştürülmez.

Eski `w-alerter.workspace.v2` localStorage anahtarı korunur. Yeni veri deposu `w-alerter-science` IndexedDB'dir. Kullanıcı kayıtları doğrulanmış canlı gözlemleri sayılmaz. Dosyalar sunucuya yüklenmez. Tarayıcı verileri silinirse kayıtlar kaybolabilir; normalize dosya yedeği ve rota JSON dışa aktarımı vardır.

Bu aşama çok kullanıcılı sunucu veya merkezi bilimsel depo kurmaz. Sınırlar: 25 MB paket, 100.000 kayıt, 64 değişken, tek harita seçiminde 5.000 kaynak öğesi. Sınır aşımında sessiz örnekleme yapılmaz. 2025 C3S/DMI SST için çevrimdışı bağdaştırıcı, ortak statik katalog, sıkıştırılmış özgün hücre parçaları ve harita gösterimi artık bağlıdır. Büyük veri sunucusu veya nesne deposu gerektiren diğer koleksiyonlar henüz bağlı değildir.

## Türler ve HYDRA

| Tür | Hazırlanan bağlantı |
| --- | --- |
| *Eubalaena glacialis* | Kullanıcının planladığı klorofil-a + Calanus + SST + türe ait gözlemler. Yöntem ve bilimsel doğrulama bekler. |
| *Megaptera novaeangliae* | Ayrı kayıt; gereksinimler henüz tanımlanmadı. |
| *Caretta caretta* | Ayrı kayıt; gereksinimler henüz tanımlanmadı. |
| *Delphinus delphis* | Ayrı kayıt; gereksinimler henüz tanımlanmadı. |

Model kaydı; kesin tür kimliği, sürüm, yöntem atfı, doğrulama kaynağı, uygulama ve açık veri gereksinimleri ister. Türler arası model kopyalanmaz. Alan/zaman sorgusu, uygun ölçüm ve ayrıca incelenmiş veri kimlikleri olmadan hesap engellenir. Metadata örtüşmesi biyolojik uygunluğu kanıtlamaz.

HYDRA motoru ayrı kayıt noktasına bağlanacaktır. Çarpışma, habitat, hız, mesafe, süre, yakıt, CO₂, düzenleme ve zamana bağlı çevre için ayrı sürümlü yöntem/birim/uygulama sözleşmeleri vardır. Varsayılan ağırlık veya yeni maliyet formülü yoktur. Eski motor mevcut `routeModel` fonksiyonuna delege edilir. HYDRA A* kaynağı olmadığından otomatik alternatif rota veya yasal uyum sonucu üretilmez. Ayrı Fuel & Carbon modülü, açık gemi girdileri ve rota segmentleriyle süre, tüketim ve doğrudan CO₂ tahminleri yapabilir; bu sonuçlar HYDRA optimizasyonu olarak sunulmaz.

## Gerçek veri bekleyenler

Henüz sağlanmamış diğer kaynaklar; ham MODIS/PACE; Calanus yoğunluğu/biyokütlesi; OBIS-SEAMAP/NOAA, akustik ve takip kayıtları; gerçek AIS; NOAA/Kanada koruma ve resmî hız düzenlemeleri. Habitat modelleri ve HYDRA 2.0 hesapları bunlarla birlikte doğrulanmış yöntem bekler. Katalog durumları bunları açıkça belirtir.

## Testler ve sınırlar

64 kaynak karşılaştırması (44 konum, 16 rota, 4 mesafe), dört referans, kayıt/yeniden yükleme, JSON, GPX, HTML kaçışı ve rapor değerleri kontrol edilir. Dil testleri kanonik ay/değerleri ve arayüz çevirilerini korur. Bilim altyapısı testleri dosya bütünlüğü, SHA-256, bozuk paket reddi, UTC, bilinmeyen kapsam, ayrı tür gereksinimleri ve verisiz/yöntemsiz modellerin sonuç üretmemesini denetler.

2025 yılına ait 12 gerçek C3S/DMI SST dosyası okunmuş ve tümü özgün hash, zaman/bounds, birim ve maske bilgileriyle denetlenmiştir. NetCDF ön işleme ortamı kurulmuş; 48 gerçek kaynak hücresi paketleme/sorgu sonuçlarıyla karşılaştırılmıştır. Güncel kapsam, kaynak metaverisi çelişkileri, 0,25° gösterim ile bölgesel 0,05° sorgu ayrımı ve testler [SST entegrasyon raporunda](SST_2025_INTEGRATION.md) açıklanır. Biyolojik uygunluk doğrulanmış sayılmaz; habitat ve tür varlığı tahmini üretilmez.

## Akıntılar ve yerel gözlemler — 28 Ekim 2026

Ortak servise dört gerçek CMEMS dosyasından iki bölge ve 24 aylık akıntı alanı eklenmiştir. Özgün 1/12° hücre sorguları, 0,494 m derinlik, kaynak ayı, eksik zaman sınırları ve belirsizlik korunur. Katalog güncellemeleri diğer kaynakları silmez. Balina arşivi yalnızca tarayıcıdaki araştırma deposunda açılır; fotoğraf lisansı koordinatlara ticari kullanım izni sayılmaz. Beş dilde sade harita ve tıklamayla açılan ayrıntılar kullanılır. Güncel kullanım/testler [akıntı ve gözlem raporunda](CURRENTS_OBSERVATIONS_INTEGRATION.md) açıklanır.

## 28 Ekim 2026: topoloji ve korunan alan güncellemesi

Önceki bölümlerde belirtilen eski HYDRA kodu eksikliği devam eder; yeni, sürümlü `hydra-geometric-astar-1.0.0` mesafe motoru ayrıca eklendi. `dist/routing/` 16 komşulu A* ve kaynaklı muhafazakâr kara/buz sahanlığı ağı kullanır. Tam çok amaçlı ekolojik HYDRA kapıları açılmaz. `ProtectionRepository` / `ProtectionDataService` yerel araştırma alan geometrisini ve kaynak künyesini tutar; düzenleme veya habitat maliyetine otomatik çevrilmez. Gerçek kapsam ve güncel davranış için `PROTECTION_ASTAR_INTEGRATION.md` esas alınmalıdır.
