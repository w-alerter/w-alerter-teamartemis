# W-ALERTER — 2025 akıntıları ve yerel balina araştırma katmanı

28 Ekim 2026. Dört gerçek NetCDF ve sağlanan `dwca-zd_1764-v1.8.zip` açılarak incelendi. Bu rapor kullanılan dosya sürümünü açıklar; sağlayıcının sonradan yayımladığı başka bir arşivle sessizce değiştirilmedi. Özgün dosyalar değiştirilmedi. Ham NetCDF, balina ZIP’i veya gözlem koordinatları ticari dağıtıma eklenmedi.

## Kullanılabilen kaynaklar

| Dosya sonu | Özgün hücre merkezlerinin kapsamı | Zaman |
| --- | --- | --- |
| 1793026877610.nc | 35–55°K, yaklaşık 80–40,0833°B | Ocak–Haziran 2025 |
| 1793027115785.nc | Aynı Kuzey Atlantik batısı ızgarası | Temmuz–Aralık 2025 |
| 1793027271872.nc | 70–60°G, yaklaşık 80°B–19,9167°D | Ocak–Haziran 2025 |
| 1793027326550.nc | Aynı Antarktika ızgarası | Temmuz–Aralık 2025 |

Kuzey Atlantik dosyalarında 241 × 480, Antarktika dosyalarında 121 × 1200 hücre vardır. Her dosyada altı zaman ve tek derinlik bulunur. İki bölge ayrı veri kümeleri olarak sunulur. Bu dosyalar Akdeniz veya bütün Kuzey Atlantik’i kapsıyor sayılmaz.

Ürün `GLOBAL_ANALYSISFORECAST_PHY_001_024`, veri kümesi `cmems_mod_glo_phy-cur_anfc_0.083deg_P1M-m_202406`, kaynak MERCATOR GLO12 / Mercator Ocean International / Copernicus Marine’dir. Dosya adındaki indirme sayısı veya `202406` sürüm eki gözlem tarihi yerine kullanılmadı. Gerçek tarihler dosyanın `time` değişkeninden çözüldü.

`time` birimi **seconds since 1970-01-01 00:00:00**, takvim `gregorian`. Yılın 12 ayı her bölgede eksiksiz ve çakışmasızdır. İlk zaman 2025-01-01, son zaman 2025-12-01’dir. Bu etiketler aylık alanları tanımlar; ayın ilk günündeki anlık ölçümler değildir.

Aylık model ortalaması tanımı, dosyanın başlığı, P1M veri kümesi kimliği ve sağlayıcının ürün dokümanıyla desteklenir. Değişkenlerdeki `cell_methods` **area: mean** biçimindedir; `time: mean` ve kesin `time_bnds` dosyalarda bulunmaz. Uygulama bunları varmış gibi oluşturmaz. `sourceInterval.start/end/rawBounds` açıkça `null`, `boundsEncoded` false kalır. Takvim ayı seçimi, kesin kodlanmış zaman sınırlarıyla karıştırılmaz. SST’nin 1981 epoch’u ve farklı dönem sınırları bu kaynağa kopyalanmadı.

## Değişkenler ve fiziksel anlam

`uo` doğuya, `vo` kuzeye doğru hız bileşenleridir. Kaynak float32, birim `m s-1`, geçerli aralık bileşen başına −5…5 m/s. `scale_factor` veya `add_offset` yoktur. Eksikler NaN’dır; kara veya sakin akıntı diye sıfıra çevrilmez. Uygulama gerçek sıfırları korur.

Derinlik **0,49402499198913574 m**, pozitif aşağıdır. Başka bir derinlik istendiğinde en yakın katman sessizce kullanılmaz. Bu katman, bütün gemi draftı boyunca bir profil değildir. Hücre bazında belirsizlik, kalite bayrağı, deniz buzu veya kesin kara maskesi sağlanmamıştır; belirsizlik sıfır veya sayısal güven yüzdesi olarak sunulmaz.

Türetilmiş büyüklük `hypot(u, v)`, **aylık ortalama vektörün büyüklüğüdür**; anlık hız büyüklüklerinin aylık ortalaması değildir. Yön `atan2(u,v)` ile gerçek kuzeyden saat yönünde, suyun **gittiği yöne** göre hesaplanır; sıfır vektörde yön null’dır. Knot dönüşümü 3600/1852 katsayısını kullanır.

İsteğe bağlı rota projeksiyonu `u·sin(θ) + v·cos(θ)` olarak, işaret korunarak ayrı sunulur. Bu projeksiyon tek başına yer hızını, rota üzerindeki yan akıntı düzeltmesini veya yakıt tasarrufunu hesaplamaz. Tarihsel aylık yüzey alanları canlı seyir tahmini, gelgit/dalga birleşik akıntısı ya da doğrulanmış optimizasyon olarak sunulmaz. Mevcut yakıt motorunun formülleri veya HYDRA kapıları değiştirilmedi; gerçek HYDRA A* kaynağı hâlâ depoda yoktur.

## Ortak veri servisi

SST ve akıntılar `EnvironmentalDataRepository` / `EnvironmentalDataService` üzerinden paylaşılır. Türlere dosya kopyalanmaz. Desteklenen yeni adlar:

`current_u` / `uo`, `current_v` / `vo`, `current_speed`, `current_direction`, `current_vector`, `current_along_track`.

```js
await getEnvironmentalValue('current_vector', 42.5, -70.2, '2025-03-16', {
  temporalMode: 'calendar-month'
});
```

Bu açık seçim Mart ayının model ortalamasını döndürür; kaynak zaman etiketi **2025-03-01T00:00:00Z**, derinlik, ham bileşenler, özgün hücre merkezi, birim, kaynak dosyası/SHA-256, ürün/atıf/lisans ve eksik belirsizlik bilgisi birlikte verilir. Varsayılan `exact` modunda 16 Mart için başka tarih sessizce seçilmez. Kapsam dışı koordinatta en yakın bölgesel sınır hücresine yapışılmaz; `outside_source_region` döner. Eksik hücrede en yakın geçerli deniz hücresi aranmaz.

`SpeciesModels.environmentalInputs` farklı kaynakların açık dönem seçeneklerini `options.byVariable` ile alır. Böylece bir çağrı SST’nin kendi dönemini, bir diğeri akıntının sağlayıcı ayını kullanabilir. Bu bağlantı doğrulanmış habitat yöntemi veya canlı olasılığı üretmez.

## Harita, performans ve yeni kaynaklar

216 gzip sorgu parçası özgün u/v float32 bitlerini korur. Native nokta sorguları 1/12° ızgarayı kullanır. Harita büyüklük/u/v için özgün hücrelerden üretilen görselleri; yön okları ise her altıncı gerçek hücreden alınan ayrı gösterim örneklerini kullanır. Nokta sorgusu ok örneklerinden yapılmaz. Oklar ayrı kapatılabilir. Harita, enlem doğrusal görseli Web Mercator’a satır bazında dönüştürür ve bölgesel görselleri kaynak alanının dışına yaymaz.

Katalog, eksenler ve hücre önbelleği kaynaklar arasında ortaktır. Aynı parça istekleri birleştirilir; native parçalar 12 girişli, yön gösterimleri dört girişli önbellekle sınırlıdır. Sürüm dizinleri kaynağın SHA-256 değerlerinden üretilir. Yeni hatalı bir veri kümesi diğer kaynakları kapatmaz.

`tools/preprocess_currents.py` çevrimdışı çalışır. `tools/environment_catalog.py` yalnızca işlenen kaynak kimliklerini günceller ve kataloğu son adımda atomik yazar. SST yeniden işlendiğinde akıntılar veya gelecekteki kaynaklar katalogdan silinmez. Tarayıcıda veya GitHub Pages üzerinde Python çalıştırılmaz. Toplam çevresel veri dağıtımı yaklaşık **65 MB**; 90 MiB sınırının altındadır. Dosya başına 25 MiB ve 10.000 dosya muhafazakâr sınırları da korunur. Ham dosyalar `data/raw/` altında Git tarafından yok sayılır.

## Balina gözlemleri: lisans ve yerel kullanım

Sağlanan arşivde **23.975** *Megaptera novaeangliae* kaydı vardır; **3.571** kayıt 2025’tendir. Bu kayıtlar başka bir balina türüne veya Caretta’ya atanmaz. Kayıt sayısı farklı birey sayısı ya da yoğunluk değildir. Tekrarlanan gözlemler ve kaynak birey kimlikleri korunur. Örnekleme çabası olmadığı için gözlem bulunmayan hücreler yokluk verisi sayılmaz.

Önemli lisans ayrımı: OBIS-SEAMAP’ın resmî alan açıklamasında `license`, **fotoğraf lisansı** olarak tanımlanır; veri kümesinin genel paylaşım politikası **CC-BY-NC (All)**’dır. Bazı satırlarda CC0 yazması, gözlem koordinatlarının ticari dağıtımına izin verildiği anlamına gelmez. Bu nedenle koordinat arşivi veya fotoğraflar ticari statik pakete konulmaz. Katalogda kaynak açıklaması ve **yerel araştırma görüntüleyicisi** vardır. Bu özellik ticari izin verilmiş gibi davranmaz.

Gözlemler → Balina arşivini aç ile kullanıcının DwC-A ZIP’i yalnızca kendi tarayıcısında işlenir. Web Worker ana arayüzü serbest bırakır. ZIP boyutu, açılmış veri sınırı, UTF-8, CRC32, girdiler, kaynak sözleşmesi, takson, tarih ve koordinatlar doğrulanır; şifreli/uygunsuz arşivler, yol geçişi, dış XML varlıkları ve bozuk satırlar reddedilir. Yinelenen kaynak kayıt kimliği sessizce birleştirilmez. Başarısız yeni import önceki veriyi değiştirmez. Dosya içerikleri veya fotoğraflar sunucuya gönderilmez; dış medya otomatik açılmaz.

Normalize gözlemler ayrı `w-alerter.observations.v1` IndexedDB’sinde saklanır. Depo kullanılamazsa görünür uyarıyla yalnızca oturum belleği kullanılır. Bozuk kayıtlar yeniden açılışta kabul edilmez. Araştırma kaydı istenirse arşiv tekrar açılarak kurulabilir; orijinal ZIP korunur. Tarayıcı verilerini silmek yerel kaydı da kaldırır.

Yıl, ay ve bildirilen konum belirsizliği filtrelenebilir; varsayılan en fazla 1 km’dir. Harita ayını izleme seçimi görünürdür; manuel yıl/ay seçimi bu bağı kapatır. Görünür kayıtlar kümelenir; kaynak kayıtlar veya sayıları azaltılmaz. Seçili kaydın bildirilen belirsizlik çemberi, kayıt/birey kimliği, orijinal tarih ve fotoğraf lisansı incelenebilir. Bir metrelik bildirimin doğrulanmış GPS doğruluğu olduğu iddia edilmez. Saat dilimi ve gerçek tarih hassasiyeti bilinmediği için kaynak zamanlar UTC’ye uydurulmaz.

Açık bir düğmeyle seçili kaynak takvim tarihi SST dönem ortalaması ve akıntı ayıyla eşleştirilir. İki kaynağın farklı hücre merkezleri, zaman etiketleri, belirsizlik ve eksik kapsamı korunur. Bu eşleştirme habitat tahmini değildir. Arşivdeki bitiş tarihi ve doğu sınırı uyuşmazlıkları gerçek kayıtların kapsamıyla birlikte saklanır.

## Tasarım ve testler

Geniş harita, beyaz arayüz, ince gezinme çubuğu, üç harita aracı ve açılır ayrıntı paneli uygulanmıştır. Kaynak/değişken/dönem ve kompakt ay geçişi haritada kalır; sorgular, kaynak kalitesi ve gözlemler tıklamayla açılır. Orijinal W-ALERTER logosu, metin adı, balinalı giriş ve beş dil korunur.

Doğrulama: 7 akıntı Python testi, 7 SST Python testi; 9 akıntı, 5 gözlem, 10 SST ve 17 yakıt JavaScript testi; 45 yeni harita ve 32 SST tarayıcı kontrolü başarılıdır. Akıntı testleri bütün native parçalardaki ve yön örneklerindeki float32 bitlerini orijinal dosyalarla karşılaştırır. Yerel ZIP gerçek tarayıcıda açılmış, 23.975 kayıt okunmuş, yeniden açılma ve SST/akıntı eşleştirmesi kontrol edilmiştir. 320/390/768 px ve beş dil testleri geçmiştir. Mevcut modelin 64 sayısal karşılaştırması, kayıt, dışa aktarım ve bilimsel inceleme kapıları korunur.

```sh
python tools/preprocess_currents.py
python checks/test_currents_preprocess.py
python checks/test_sst_preprocess.py
node --test checks/currents.mjs checks/observations.mjs checks/environment.mjs checks/fuel-carbon.mjs
```

Ham dosyalar gerekir. `checks/workbench-browser.html` ve `checks/environment-browser.html` yalnızca geçici test sayfası olarak kullanılır; üretime eklenmez. AIS ZIP’i erişilemediği için AIS verisi entegre edilmiş gösterilmez.

## Birincil kaynaklar

- Ürün ve aylık model alanları: https://data.marine.copernicus.eu/product/GLOBAL_ANALYSISFORECAST_PHY_001_024/description
- Copernicus atıf/dağıtım açıklaması: https://help.marine.copernicus.eu/en/articles/4444611-citing-copernicus-marine-products-and-services
- Ticari ve eğitim amaçlı erişim: https://help.marine.copernicus.eu/en/articles/4220332-how-to-register-for-copernicus-marine-service
- Belirleyici lisans metni: https://marine.copernicus.eu/user-corner/service-commitments-and-licence (dosyada belirli bir lisans revizyonu yok; uydurulmadı).
- Happywhale alan tanımları ve NC paylaşım politikası: https://seamap.env.duke.edu/dataset/1764/html
- Sağlanan DwC-A yayınının kayıt/atıf/lisans bilgisi: https://ipt.env.duke.edu/resource?r=zd_1764

## Dört kaynak dosyasının SHA-256 denetimi

| Dosya | SHA-256 |
| --- | --- |
| cmems_mod_glo_phy-cur_anfc_0.083deg_P1M-m_1793026877610.nc | 3562e16bedb6297addac584e23275fe468ac9792470dd27ea529099052d9aac6 |
| cmems_mod_glo_phy-cur_anfc_0.083deg_P1M-m_1793027115785.nc | 45089b0918d4a07d9e30f8d249ad5d3ab30aeb3e39733ae60ee55776ca43b3ee |
| cmems_mod_glo_phy-cur_anfc_0.083deg_P1M-m_1793027271872.nc | 6427cc7eb0c2e9a7becfa625a0efa0c445d060ec6859e57cad90d141577fc766 |
| cmems_mod_glo_phy-cur_anfc_0.083deg_P1M-m_1793027326550.nc | 0d84f9ac3566db174f78828aede2acca73ef69b9005bbfe37f6be1e8b74de356 |
