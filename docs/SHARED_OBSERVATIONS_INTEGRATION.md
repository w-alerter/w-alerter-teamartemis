# W-ALERTER — ortak gözlem verileri entegrasyonu

28 Ekim 2026. Mevcut site, SST ve akıntı altyapısı üzerine eklenmiştir. Ham kaynaklar gerçek dosyalardan okunmuş; dosya adına veya ekran görüntüsüne dayanılarak veri üretilmemiştir.

## Kaynak mutabakatı

| Kaynak | Gerçekte okunan satır | Kamusal pakete alınan |
| --- | ---: | ---: |
| `obis_seamap_species_180527_csv_101850.zip` — Balaenoptera physalus | 231.235 | 8.193 |
| `obis_seamap_species_180528_csv_101851.zip` — Balaenoptera musculus | 22.803 | 807 |
| `obis_seamap_species_180530_csv_101848.zip` — Megaptera novaeangliae | 450.680 | 12.381 |
| `obis_seamap_species_180537_csv_101847(1).zip` — Eubalaena glacialis | 23.346 | 17.562 |
| `23305_RWSAS.csv` — Eubalaena glacialis | 13.200 | 12.651 |
| **Toplam** | **741.264** | **51.594** |

`101849.zip`, `101848.zip` ile aynı SHA-256 değerine sahiptir: ikinci kez sayılmaz. Yeni yüklenen üç WDPA arşivi, daha önce entegre edilen arşivle aynıdır. Erişilebilir dört WDPA kopyası da `6dab7615002e95031ba3dd313a7beb04c27c3ab213e52cc9ad6af827588e5cd2` özetini verir; mevcut 37 alan kaydı / 35 farklı saha çoğaltılmaz. Sınırlar mevcut yerel araştırma bağdaştırıcısında kalır.

Ham OBIS satırları noktasal gözlem, fotoğraf, takip, akustik ve model çıktılarını birlikte içerir. Bunlar tek bir doğrulanmış canlı gözlemi sınıfına dönüştürülmez. Dağıtılan alt kümede 49.075 `ptobs` ve 2.519 `ptacs_calls` kaydı bulunur; model çıktıları dağıtılan gözlem noktaları arasına alınmamıştır. 1.726 kaynak yokluk kaydı gri renkle ve açık yokluk etiketiyle korunur.

## Kaynak koşulları ve kalite

OBIS'in indirilen `datasets_and_citations.csv` tablosunda `Included=YES`, `Published=Yes`, `Share Policy=CC0` olan kaynaklar seçilmiştir. Her uygun kaynağın ekli FGDC kullanım koşulları da okunmuştur. 644 farklı kaynak kimliğinin ortak alanları dört dışa aktarım arasında karşılaştırılmış; çelişki saptanmamıştır. Kamusal pakette 274 CC0 OBIS kaynağı ve bir NOAA RWSAS kaynağı bulunur. Kaynak atfı ve metaveri SHA-256 değerleri korunur; katkıcı e-postaları, fotoğraflar ve serbest notlar yayımlanmaz.

OBIS kullanım koşulları yeniden dağıtım için açık CC0 istisnası tanımlar. Bu nedenle CC-BY'nin ticari kullanıma izin vermesi, bu ürün içinde indirilen kayıtların yeniden yayımlanmasının otomatik onayı olarak kullanılmamıştır. **689.121 non-CC0 satır kamusal koordinat paketine alınmamıştır.** Bu karar kayıtları silmez veya yeni izin verildiği anlamına gelmez.

RWSAS, resmî NOAA InPort 23305 kaydındaki kamusal CSV'dir; genel NOAA yeniden kullanım koşulları ve kaynak atfı korunur. CC0 olduğu ayrıca varsayılmamıştır. NOAA onayı veya ortaklığı iddia edilmez. Kaynak metaverisi 31 Ocak 2018'e kadar olan dışa aktarımı tanımlar; dağıtılan kayıtların fiilî tarihleri **6 Şubat 2002 – 27 Ocak 2018** arasındadır. Bu katman canlı gemi uyarısı değildir.

RWSAS'ta 549 satır ayrı incelemeye ayrılmıştır. Bir satır birden çok kontrolü ihlal ederse ilk neden sayılır:

| Birincil ayrılma nedeni | Satır |
| --- | ---: |
| Eksik veya geçersiz koordinat | 203 |
| Kaynak bölgesiyle çelişen pozitif boylam | 21 |
| Metaveride bildirilen bölge dışında | 3 |
| Kaynakta yinelenen olarak işaretlenmiş | 322 |

Pozitif boylamlar otomatik eksiye çevrilmemiştir. Koordinat, kesin konuma veya en yakın hücreye zorlanmamıştır. Satır kimlikleri ve inceleme nedenleri yayımlanmayan `data/raw/observations/2026-10/quarantine-audit.json` dosyasında korunur. Kaynakta toplam 327 yinelenme işareti vardır; bunların beşi daha önce koordinat kontrolünde ayrılır.

RWSAS koordinatları gözlem gemisine veya canlıya ait olabilir. `CERTAINTY`, tür teşhis güvenidir; GPS doğruluğu veya konum belirsizliği değildir. `GROUPSIZE`, kaynaktaki grup değeridir; benzersiz birey veya yoğunluk toplamı üretilmez. Kaynaklar arasında ortak kimliği olmayan olayların aynı olayı temsil edebileceği açıkça belirtilir; koordinata göre hayvan birleştirilmez.

## Tarih, konum ve belirsizlik

OBIS `tprecision`, yıl–ay–gün–saat–dakika–saniye için altı ayrı sağlanma bitidir. Yalnızca sağlanan bileşenler gösterilir. Aylık/yıllık kayıttaki `01-01 00:00:00` yer tutucuları gerçek gün ve saate çevrilmez. `lprecision`, ondalık basamak sayısıdır; metre cinsinden hata yarıçapı üretilmez. Kaynak bir konum belirsizliği sağlamıyorsa sonuç `null` kalır.

Saat dilimi ve yaz saati uygulaması doğrulanmamış kayıtlar UTC'ye dönüştürülmez. Ham yerel tarih/saat, hassasiyet bitleri ve varsa ham saat dilimi alanı korunur. RWSAS'ın iki basamaklı yılları, kaynağın açık 2002–2018 kapsamına göre çözülür; işletim sistemi veya JavaScript'in örtük yıl eşiği kullanılmaz. Saat içermeyen CSV tarihinden gece yarısı UTC üretilmez.

Dağıtılan OBIS kayıtlarının kaynak takvim tarihi aralığı 3 Mayıs 1978 – 22 Haziran 2026'dır. Bu aralık UTC kapsamı veya sürekli izleme kapsamı olarak sunulmaz. 2025 seçimi fin/mavi/kambur/gerçek balina için sırasıyla 545 / 6 / 408 / 168 uygun kayıt döndürür. 2025 için NOAA RWSAS sorgusu sıfır kayıt verir ve 2017'ye kendiliğinden geçmez.

## Uygulama ve kullanım

Harita → Gözlemler: tür, yıl, ay ve kaynak seçimi. Ayrıntılı açılır bölümde kayıt türü, kaynak varlığı/yokluğu ve tür teşhis güveni filtrelenir. Bir noktaya veya liste satırına basıldığında kaydın kaynak tarihi, hassasiyeti, türü, kimliği, kaynak atfı ve kullanım koşulları açılır. Haritadaki gözlem dönemi rozeti, SST ayından bağımsızdır. Önceki Happywhale yerel içe aktarıcısı ayrı bir açılır bölümde korunmuştur.

`SharedObservationRepository` kaynaklardan bağımsız bir manifest ve tarih/tür dilimlerini okur. `ObservationDataService` filtreleme ve çevre bağlamını sunar. Ortak API:

```js
const result = await WAScience.observationDataService.query({
  speciesId: 'megaptera-novaeangliae', year: '2025', month: '3',
  source: 'obis', presence: 'reported'
});
// result.status, records, sources, query, sourceRevision, uncertaintyPolicy
const context = await WAScience.observationDataService.environmentalContext(result.records[0]);
```

Çevre bağlamı mevcut `EnvironmentalDataService` üzerinden SST için açık `interval-mean`, akıntı için açık `calendar-month` seçer. Kesin gözlem günü yoksa sorgu yapılmaz. Aylık çevre bağlamı, gözlem anındaki ölçüm olarak gösterilmez. Kaynak dönemi yoksa farklı tarih kullanılmaz. Tür adaptörleri aynı servisi `SpeciesModels.observationInputs()` üzerinden tüketebilir; fin ve mavi balina katalogları eklenmiştir. Bilimsel habitat modelleri hâlâ ayrı doğrulanmış yöntem gerektirir. Caretta için gözlem kaynağı bu dosyalarda yoktur; SST kopyalanmaz veya Caretta kaydı uydurulmaz.

Ön işleme geliştirme aşamasında Python standart kitaplığıyla ve akış halinde yapılır:

```bash
python tools/preprocess_observations.py --input /absolute/path/to/uploads
```

Çıktı 152 bağımsız gzip JSON dilimidir; dilim başına en fazla 2.000 kayıt. Bütün dilimlerin toplamı **1.340.571 bayt**; manifest 262.090 bayttır. İlk gözlem açılışında yalnızca seçili 2025 kambur balina dilimi yüklenir. Kaynak ZIP/CSV ve NetCDF dosyaları tarayıcıya indirilmez. Sıkıştırılmış ve açılmış dilimlerin SHA-256 değerleri doğrulanır; bozuk veri sonuç üretemez. En fazla dört eşzamanlı okuma ve sekiz dilimlik bellek önbelleği kullanılır. Kaynak veya işleme biçimi değiştirilirken paket yolu/sürümü de yükseltilmelidir.

## Gemini A* önerisinin mevcut motorla karşılaştırılması

Kara maskesi + A* ilkesi mevcut motorla aynıdır. Çalışan motor daha kaba öneriyle değiştirilmemiştir:

| Özellik | Önerilen | Korunan mevcut uygulama |
| --- | --- | --- |
| Izgara | 0,45° / 8 komşu | 0,1° / 16 komşu |
| Mesafe | Enlem/boylamda Öklid | Haversine deniz mili |
| Sezgi ağırlığı | 1,1 | 1,0; aynı grafikte Dijkstra ile doğrulanmış |
| Engel kontrolü | Komşu nokta | Bütün kenar boyunca konservatif hücre kesişimi; köşe kesmeleri de engellenir |
| Son çizgi | Noktalardan polyline | Kısaltma sonrası jeodezik sıklaştırma ve tüm parçaların yeniden kontrolü |
| Ekolojik maliyet | `getSafetyCost` | Doğrulanmış yöntem olmadan puan eklenmez |

Doğal Dünya kaynaklı mevcut maskenin −82,5° güneyindeki **90.000 hücresinin tamamının engelli olduğu** ayrıca doğrulanmıştır. Ekran görüntüsündeki −69,584/−111,759 → −67,994/−30,402 rotası 720 kontrol edilmiş koordinatla 2.133,6895 NM dolaşır; eski 1.639,6214 NM doğrudan çizgi kaynak kara geometrisini keser. Bağımsız Shapely kontrolü hesaplanan rotanın kaynak kara/buz sahanlığı geometrisini kesmediğini doğrular. Bu, güncel deniz buzu, derinlik veya seyir izni doğrulaması değildir.

## NASA klorofil-a durumu

Erişilebilir eski kaynakta yalnızca dört MODIS-Aqua referans sabiti vardır. Yüklenen NetCDF dosyaları 12 SST ve dört akıntı dosyasıdır; ham NASA Earthdata klorofil-a ürünü bulunmamıştır. OBIS `oceano` alanları nokta kayıtlarına eklenmiş çevresel değişkenlerdir; ham, tarihli ve kaynak künyesi doğrulanmış NASA klorofil-a ızgarası yerine kullanılmamıştır. Tam entegrasyon için özgün NetCDF/HDF ürünü ve ilgili metaverisi yeniden sağlanmalıdır.

## Doğrulama

- Dört Python testi: 38.943 yayımlanan OBIS noktasının tamamı gerçek CSV satırlarıyla koordinat/tarih/bit/kayıt türü/grup değeri düzeyinde bağımsız eşleştirildi; 12.651 NOAA noktası kaynak satırlarıyla karşılaştırıldı. Ham kaynak özetleri ve sayım mutabakatı geçti.
- Yeni ortak gözlem modülü: sekiz Node testi; 51.594 kayıt, kaynak koşulları, boş dönem, kesin tarih, bozuk paket, önbellek, tür adaptörleri ve beş dil doğrulandı.
- Mevcut SST/akıntı/yakıt testleri: 36; önceki yerel gözlem/korunan alan testleri: 14; A* testleri: dokuz. Toplam **67 Node testi** geçti.
- Bağımsız Shapely topoloji testleri: üç. Eski modelin 64 sayısal karşılaştırması, çalışma alanı, dışa aktarım, bilimsel model kapıları ve çeviri kontrolleri geçti. Eski `model.js` ve `workspace.js` dosya özetleri aynı kaldı.
- 16 özgün SST/akıntı NetCDF dosyasının SHA-256 değerleri önceki doğrulanmış envanterle yeniden karşılaştırıldı. NetCDF okuma/dönüşüm kodu ve dağıtılan çevre verileri değiştirilmedi; bu çalışmada Python NetCDF dönüşüm testleri yeniden çalıştırılmadı.
- Tarayıcıda **132 kontrol** geçti: yeni gözlem modülü 20 + altı mobil/tablet kontrolü; A* / korunan alanlar 35; akıntı / önceki gözlem aracı 42; SST 29. Yeni görünüm 320/390/768 px genişlikte ve beş dilde kontrol edildi.

## Birincil kaynaklar

- [OBIS-SEAMAP kullanım koşulları](https://seamap.env.duke.edu/content/content/termsofuse)
- [OBIS veri sözlüğü — tprecision, lprecision, saat dilimi ve grup değeri](https://seamap-dev.env.duke.edu/html/help/z_union_dic.html)
- [NOAA RWSAS kaynak kaydı](https://www.fisheries.noaa.gov/inport/item/23305)
- [NOAA RWSAS alan tanımları](https://www.fisheries.noaa.gov/inport/item/51474)
- [NOAA yeniden kullanım açıklaması](https://www.noaa.gov/office-education/outreach-communication/faq)

Görsel kontrol: `docs/preview-shared-observations.jpg`.
