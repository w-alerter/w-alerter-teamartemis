# W-ALERTER — Korunan alanlar ve A* rota düzeltmesi

28 Ekim 2026. Bu değişiklik mevcut v13 üzerine uygulanmıştır.

## Haritadaki hatanın nedeni ve düzeltme

Kullanıcının ekran görüntüsünde iki nokta doğrudan bir Leaflet çizgisiyle bağlanıyor, çizgi Antarktika karasını kesiyordu. Depodaki `routeModel` yalnızca sırayla girilen noktaların Haversine mesafesini ve klasik klorofil göstergelerini hesaplıyordu. Verilen `alerter1.html` ve erişilen Git geçmişinde eski HYDRA A* uygulaması bulunamadı.

Yeni `hydra-geometric-astar-1.0.0`, ayrı `dist/routing/` modülüdür. Bu, kayıp eski motorun geri getirildiği iddiası değildir. 16 komşuluk (eksenel, çapraz, 2×1 ve 1×2), Haversine kenar maliyeti, kabul edilebilir Haversine sezgiseli ve öncelik kuyruğu kullanır. Köşeden geçişte iki yan hücre de kontrol edilir. Uzun kenarların atladığı tüm hücreler kontrol edilir. Son görünürlük sadeleştirmesinde de aynı denetim tekrar uygulanır. Büyük daire yayları en fazla 0,05° açısal aralıklarla sıklaştırılır; harita, dışa aktarımlar ve mesafe hesabı aynı sıklaştırılmış geometriyi kullanır. A* maliyeti aynı test grafiğinde Dijkstra ile karşılaştırılmıştır.

Kara veya statik buz sahanlığı ile herhangi bir teması olan **0,1° hücrenin tamamı kapalıdır**. Noktalar otomatik denize taşınmaz. Sınırdaki belirsiz kıyı hücreleri de kapalıdır. İki–elli geçiş noktası desteklenir. Arama bölgesi önce 12° kenar payıyla, yol bulunamazsa 30° payla sınanır. Hücre/arama/süre bütçesi aşılırsa açık hata döner. Çözüm bulunamazsa düz çizgiye dönüş yoktur. Nokta ekleme, silme, sıralama veya sürükleme önceki sonucu hemen temizler; eski worker sonucu yeni taslağa uygulanmaz.

### Ekran görüntüsü regresyonu

| Özellik | Sonuç |
| --- | --- |
| Başlangıç | −69.584°, −111.759° |
| Varış | −67.994°, −30.402° |
| Doğrudan Haversine mesafesi | 1639.621371 NM |
| Yeni A* yol geometrisi | 2133.689525 NM |
| Son çizim noktası | 720 |
| Aramada açılan düğüm | 62904 |
| En kuzeydeki yol noktası | yaklaşık −62.85° |
| Eski çizgi / kaynak engelleri | Kesişiyor |
| Yeni yol / kaynak engelleri | Kesişmiyor — bağımsız Shapely denetimi |

Harita, etap tablosu, JSON, GPX izi ve yeni A* raporu aynı geometriyi kullanır. GPX artık sadece iki uç noktadan oluşan düz bir bağlantıyı hesaplanmış yol gibi sunmaz. Yakıt motoru hesaplanan geometriyi `geometric-astar-reference` olarak alır; bu, kullanıcı onaylı seyir rotası veya ekolojik optimizasyon onayı değildir. Gemi girdileri ve mevcut yakıt doğrulama kapıları korunur. Tam HYDRA ekolojik/çok amaçlı maliyet kapıları hâlâ doğrulama bekler. Klasik `model.js` ve `workspace.js` dosyaları değiştirilmemiştir.

### Topoloji kaynağı ve gerçek sınırları

- Natural Earth **1:10m land 5.1.1**, SHA-256: `e547d749445eaa0964aba76738090ec88f5e63c4585122170f98c67a7ea922dc`.
- Natural Earth **Antarctic ice shelves 4.1.0**, ZIP içindeki gerçek VERSION.txt esas alındı; tanıtım sayfası 4.0.0 diyebiliyor. SHA-256: `1d421d2487e2721a6e0aee8187e008c9bd8f0adbf4a5297b8503f7bf3c30b04d`.
- İki kaynakta 170 geçerli geometri var; geometri onarımı gerekmedi.
- Üretilen 3600×1700 bit ağı: −180…180° boylam, −85…85° enlem, güneyden kuzeye. Tarih çizgisinde sarma desteklenir.
- Kaynak ham ZIP dosyaları `data/raw/topology/` içinde korunur; dağıtımda yoktur. Yalnızca 41.062 bayt sıkıştırılmış engel ağı ve künyesi yayımlanır.
- Ham bit ağı SHA-256: `f3eb0c58542dda8c3893b600db71d8affd2e84f6b9d4459173ebcd39fe462a20`.
- Natural Earth kamu malıdır ve ticari kullanıma açıktır. Kaynak/işleme yöntemi arayüzde korunur.

**Bu mod bir seyir güvenliği onayı değildir.** Kartografik kaynak ve 0,1° ağ küçük adaları, dar geçitleri, güncel kıyı değişikliklerini ve liman erişimini seyir haritası hassasiyetinde temsil etmez. Antarktika buz sahanlığı verisi eski MOA kaynaklarına dayanır; güncel mevsimsel deniz buzu değildir. Batimetri, gemi su çekimi, güncel buz, yerel mevzuat, trafik ayrım düzenleri, hava ve doğrulanmış ekolojik maliyetler bu hesapta yoktur. Gösterilen rota aranan ağ içindeki mesafe çözümüdür; küresel en iyi ticari/ekolojik veya yasal seyir rotası olarak adlandırılmaz. Kaynak veriye karşı kesişimsiz olması gerçek denizde seyredilebilir olduğunu kanıtlamaz.

## Yeni WDPA / WD-OECM arşivi

Asıl yükleme doğrudan okundu: `WDPA_WDOECM_Oct2026_Public_PO_shp(1).zip`, 13.430.260 bayt, SHA-256 `6dab7615002e95031ba3dd313a7beb04c27c3ab213e52cc9ad6af827588e5cd2`.

Üç iç ZIP birlikte incelendi; 36 poligon ve 1 MultiPoint kaydı var. Toplam **37 SITE_PID, 35 SITE_ID**, 188.464 koordinat çifti. Aynı SITE_ID'nin alt bölümleri birleştirilip kaybedilmez. 388 satırlık kaynak tablosundan kullanılan 7 METADATAID bağlantısı doğrulandı. DBF UTF-8, PRJ WGS 84 / EPSG:4326, SHP / SHX / DBF kayıt sayıları ve ofsetleri tutarlı. 37 geometrinin tamamı bağımsız PyShp + Shapely denetiminde geçerli.

| Alan | Gerçek dosya içeriği |
| --- | --- |
| SITE_TYPE | 37 PA; OECM kaydı yok |
| REALM | 13 Terrestrial, 13 Coastal, 11 Marine |
| ISO3 kayıtları | GRL 25, BVT 2, ATF 5, HMD 4, SGS 1 |
| Statü | 34 Designated, 3 Inscribed |
| STATUS_YR | 1970–2024; güncel/geçmiş sınır geçerlilik aralığı değildir |
| NO_TAKE | 13 Not Applicable, 19 Not Reported, 3 All, 2 Part |
| Sürüm etiketi | 2026-10 — dosya/katman adından; gözlem tarihi değil |
| Kapsam | Yüklenen bölgesel seçki; küresel veri tabanının tamamı değil |

Kılavuz 1.6 / 2019 alan adları gerçek DBF'nin yeni `SITE_ID`, `SITE_PID`, `SITE_TYPE`, `REALM` şemasıyla karıştırılmaz. Bazı eski metaveriler ve alan değerleri tutarsızdır: 23 poligonda bildirilen deniz alanı sıfırken GIS deniz alanı pozitiftir. Kaynak değerleri değiştirilmez; sınıflar veya alanlar otomatik yeniden üretilmez. Çakışan alanların yüzölçümleri toplanmaz.

### Kullanım ve veri güvenliği

Harita → **Katmanlar → Korunan alanlar → Korunan alan arşivini aç**. Kullanıcı tam dış ZIP dosyasını seçer. Dosya bir Web Worker içinde yerel okunur; tarayıcıya özel ayrı IndexedDB deposunda tutulur. Açıldıktan sonra ada / ülke koduna / SITE_PID'ye göre arama, REALM / SITE_TYPE / NO_TAKE filtreleri, alan seçimi, kaynak künyesi, katman açma-kapama ve tüm kayıtlar üzerinde nokta sorgusu vardır. Sayfa yenilenince bu tarayıcıdaki arşiv geri gelir. Bozuk yeni arşiv önceki geçerli katmanı silmez.

`ProtectionRepository` ve `ProtectionDataService` SST servisinden ayrıdır. Örnek:

```javascript
WAScience.protectionDataService.getProtectionAt(latitude, longitude)
// {status, matches:[{id, siteId, relation, status, statusYear, noTake, ...}],
//  source:{release, sha256, originalFile, ...}, quality, uncertainty:null}
```

Sorgu filtrelenmiş haritadan bağımsız, yüklenen bütün kayıtlarda çalışır. Poligon delikleri, ayrı bileşenler ve sınır teması ayrılır. MultiPoint bir alan değildir; nokta çevresine bildirilen yüzölçümünden bir yarıçap üretilmez. Sayısal yuvarlama toleransı bir doğruluk/buffer iddiası değildir. Eşleşme yokluğu “korumasız” demek değildir. `NO_TAKE=Part` iç zonları çizmez; korunan alan varlığı gemi geçiş yasağı/hız limiti veya canlı varlığına dönüştürülmez. `State Verified` metre cinsinden doğruluk değildir. Ekim 2026 sürümü, seçili 2025 SST/akıntı ayına sessizce geçmiş statü olarak uygulanmaz.

Protected Planet şartları ticari kullanım ve yeniden dağıtım için ayrıca UNEP-WCMC izni gerektirir. Bu nedenle **ham arşiv, kaynak alan listeleri ve türetilmiş sınırlar herkese açık dağıtım paketine konmadı**. Yayımlanan özellik yalnızca yerel, ticari olmayan araştırma okuyucusudur. Yerel açmak ticari izin sağlamaz; bu katman ticari rota motorunda maliyet/engel olarak kullanılmaz. Ticari ürün katmanı için uygun yazılı izin/lisanslı kaynak gerekir. İzin iddiası bir kullanıcı kutucuğuyla üretilmez.

## NASA klorofil-a durumu

Mevcut dosyalar, kaynak HTML ve katalog yeniden arandı. Ham NASA Earthdata / MODIS-Aqua klorofil-a NetCDF/HDF dosyası bulunamadı. Yalnızca dört eski sabit korunuyor: Ekim 0.4091, Kasım 0.3253, Aralık 0.3481, Ocak 0.3303 mg/m³. Ürün sürümü, kesin yıl ve ölçüm alanı bu sabitlerle doğrulanamaz. Gerçek zaman/konum sorgusu için ham NASA dosyalarının tekrar sağlanması gerekir. Yeni bir klorofil haritası veya habitat yüzdesi uydurulmadı.

## Doğrulamalar

- Yeni alan okuyucusu: 9 Node testi, tüm kaynak DBF özellikleri PyShp ile birebir; **623 bağımsız Shapely nokta/sınır karşılaştırması**.
- A* motoru: 8 Node testi; gerçek ekran görüntüsü regresyonu, aynı grafikte Dijkstra, köşe/uzun kenar geçişleri, kara noktası, kaynak kapsamı, arama bütçesi, tarih çizgisi, hatalı ağ ve yakıt geometrisi.
- Topoloji: 3 Python testi; kaynak/ürün özetleri, 1000 bağımsız tüm-hücre kesişim denetimi, eski/yeni çizginin özgün engel poligonlarıyla kesişimi.
- SST, akıntılar, Happywhale ve yakıt modülleri: mevcut 41 Node testi geçti. Toplam kapsam **58 Node testi**; eski 64 sayısal karşılaştırma, kayıt, dışa aktarma, bilimsel kapı ve beş dil denetimleri de geçti.
- Tarayıcı: gerçek yerel ZIP içe aktarma ve IndexedDB yenilemesi; A*, GPX/JSON/rapor tutarlılığı, iptal/eskime ve alan katmanı kontrolleri; TR/EN/DE/FR/ES, 320/390/768 piksel düzenleri ve mevcut gerçek kaynak SST/akıntı kontrolleri. 35 yeni bütünleşik test + 6 küçük ekran denetimi geçti. Mevcut akıntı arayüzü 42 kaynak testi + 3 küçük ekran, SST arayüzü 29 kaynak testi + 3 küçük ekran geçti; toplam **118 tarayıcı kontrolü**. Test sayfaları dağıtım paketinden kaldırıldı.

## Kaynaklar

- https://www.protectedplanet.net/en/legal
- https://www.protectedplanet.net/en/resources/wdpa-manual
- https://www.ibat-alliance.org/
- https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-land/
- https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-antarctic-ice-shelves/
- https://www.naturalearthdata.com/about/terms-of-use/
