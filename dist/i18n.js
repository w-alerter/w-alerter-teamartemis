'use strict';
/* Presentation language only. ARSIV keys, measurement values and saved data stay canonical. */
const I18n = (()=>{
const pairs=`
ORTAK VERİ KATALOĞU|SHARED DATA CATALOGUE
Yakıt & karbon|Fuel & carbon
Kuzey Atlantik haritası|North Atlantic map

Çalışma alanı menüsü|Workspace navigation
Veri bölümleri|Data sections
Rota|Route
Veriler|Data
Kaynaklar|Sources
Türler|Species
Yöntem|Method
Tanıtıma dön|Back to overview
Harita, rota ve veriler tek çalışma alanında.|Map, routes and data in one workspace.
Dosya ekle|Add a file
Pencereyi kapat|Close dialog
Mevcut referans|Existing reference
Katmanlar|Layers
Altlık harita|Basemap
Konum modeli|Location model
Rota hesabı|Route calculation
Mevcut rota hesabı|Existing route calculation
Hesaplama yöntemi henüz bağlanmadı.|The calculation method is not connected yet.
Veri gereksinimleri|Data requirements
Henüz kayıtlı sefer yok.|No saved voyages yet.
Henüz gözlem yok.|No observations yet.
Kaydettiğiniz rotalar burada görünür.|Your saved routes appear here.
Konum analizleriniz burada saklanır.|Your location analyses are stored here.
Teknik ayrıntılar|Technical details

Geçiş göstergesi, mevcut modelde oran × 50 olarak hesaplanır ve %99.8 ile sınırlanır. Oran 0.5’in altındaysa oran × 18 kullanılır. Bu gösterge doğrulanmış bir balina olasılığı değildir.|The legacy indicator is ratio × 50, capped at 99.8%. Ratios below 0.5 use ratio × 18. This indicator is not a validated whale probability.

Veri merkezi|Data centre
Platform modülleri|Platform modules
Klasik analiz|Legacy analysis
Kuzey Atlantik|North Atlantic
Tür modelleri|Species models
Klasik model · Antarktika referansları. Türlere özgü habitat tahmini değildir.|Legacy model · Antarctic references. This is not a species-specific habitat prediction.
Yöntemi incele ↗|Explore the method ↗
Klasik model göstergesi|Legacy model indicator
Doğrulanmış olasılık değildir|Not a validated probability
KLASİK YAKIT GÖSTERGESİ|LEGACY FUEL INDICATOR
Kaynak künyesi ↗|Source metadata ↗
Kaynak kodda NASA MODIS-Aqua olarak belirtilen dört aylık referans korunmuştur. Ham dosya, ürün kimliği, yıl aralığı ve kesin coğrafi kapsam henüz sağlanmamıştır.|The four monthly references attributed to NASA MODIS-Aqua in the supplied source are preserved. The raw file, product ID, years and exact geographic coverage have not been supplied.
Bu gösterge doğrulanmış bir balina olasılığı değildir.|This indicator is not a validated whale probability.
Eski model sabitleri: 10 knot, %28.5, 2.5 L/NM. Gemiye özgü yakıt veya CO₂ hesabı değildir.|Legacy model constants: 10 knots, 28.5%, 2.5 L/NM. This is not a vessel-specific fuel or CO₂ calculation.
W—A / VERİ ALTYAPISI|W—A / DATA INFRASTRUCTURE
Kaynağı belli.|Known sources.
Sınırları açık.|Clear limits.
Her katman, kendi kaynağıyla.|Every layer, with its source.
Klasik modelin yöntemi ↗|Legacy methodology ↗
01 / MEVCUT REFERANS|01 / EXISTING REFERENCE
Kaynak koddan korunuyor|Preserved from the source
Klorofil-a · Dört aylık klasik referans · mg/m³|Chlorophyll-a · Four monthly legacy references · mg/m³
Ham uydu dosyası bu projede yok.|The raw satellite file is not in this project.
Kaynak ayrıntıları ↗|Source details ↗
Yeni veri katmanları|New data layers
BAĞLANTI PLANI|INTEGRATION PLAN
02 / DOSYA KABULÜ|02 / FILE INTAKE
Veriye yer aç.|Make room for data.
Kaynağı, zamanı ve kapsamı kayıt altına alın.|Record the source, time and coverage.
Dosyayı incele|Inspect a file
Şu anda yalnızca metadata içeren W-ALERTER JSON paketleri kaydedilebilir. Diğer biçimler dosyaya özel bağdaştırıcı bekler.|Only W-ALERTER JSON packages with metadata can currently be saved. Other formats require a file-specific adapter.
Henüz bir dosya seçilmedi.|No file selected yet.
Teknik kontrolü kabul et ve kaydet|Accept technical checks and save
Bilimsel onay verilmez. Kayıt bu tarayıcıya özeldir.|No scientific approval is granted. Storage is local to this browser.
YEREL VERİ KATALOĞU|LOCAL DATA CATALOGUE
Harita çalışma alanı ↗|Map workspace ↗
W—A / KUZEY ATLANTİK|W—A / NORTH ATLANTIC
Okyanus.|The ocean.
Katman katman.|Layer by layer.
VERİ ÇALIŞMA ALANI|DATA WORKSPACE
Yalnızca kaynağı olan ölçümler.|Only measurements with a source.
Veri merkezini aç ↗|Open data centre ↗
KATMAN SEÇİMİ|LAYER SELECTION
Gözlemden haritaya.|From source to map.
Veri seti|Dataset
Değişken ve birim|Variable and unit
Ölçüm zamanı (UTC)|Measurement time (UTC)
Eksik ölçümler çizilmez. Enterpolasyon veya habitat tahmini yapılmaz.|Missing measurements are not plotted. No interpolation or habitat prediction is performed.
Kuzey Atlantik veri haritası|North Atlantic data map
Altlık harita · Bilimsel veri katmanı değildir|Basemap · Not a scientific data layer
Kaynaklar & kapsam ↗|Sources & coverage ↗
W—A / TÜRE ÖZGÜ MİMARİ|W—A / SPECIES-SPECIFIC ARCHITECTURE
Her tür.|Every species.
Kendi modeli.|Its own model.
MODEL ALTYAPISI|MODEL INFRASTRUCTURE
Ortak okyanus. Farklı veri gereksinimleri.|One ocean. Different data requirements.
Analiz için yeterli veri bulunmuyor. Henüz bilimsel model bağlanmadı.|Insufficient data for analysis. No scientific model has been connected yet.
Veri bağımlılıklarını incele ↗|Explore data dependencies ↗
W—A / ROTA MİMARİSİ|W—A / ROUTING ARCHITECTURE
Doğru veriyle.|With the right data.
GENİŞLETİLEBİLİR ALTYAPI|EXTENSIBLE INFRASTRUCTURE
Yeni maliyetler, doğrulanmış yöntemlerle.|New cost terms, with validated methods.
MEVCUT MOTOR|EXISTING ENGINE
Klasik rota planlayıcı|Legacy route planner
Sıralı geçiş noktaları, Haversine mesafesi ve mevcut klorofil eşikleri korunuyor.|Ordered waypoints, Haversine distance and existing chlorophyll thresholds are preserved.
Rota planlayıcıyı aç ↗|Open route planner ↗
HYDRA kaynak kodu bekleniyor.|Awaiting HYDRA source code.
16 yönlü A* uygulaması bu depoda bulunamadı. Motor bağlantısı hazır; yeni bir algoritma yazılmadı.|The 16-direction A* implementation was not found in this repository. The engine interface is ready; no replacement algorithm has been written.
HYDRA 2.0 bileşenleri|HYDRA 2.0 components
Yöntem ve veri bekliyor|Awaiting method and data
Yeni risk, yakıt veya CO₂ sonucu üretilmiyor.|No new risk, fuel or CO₂ results are produced.
Mevcut hesaplama yöntemi ↗|Existing calculation method ↗
Kaynak ayrıntılarını kapat|Close source details
Klasik göstergeler doğrulanmış tür olasılığı, gemiye özgü yakıt tüketimi veya CO₂ hesabı değildir. NASA ham ürün dosyası, yıl aralığı ve kesin kapsam sağlanmamıştır.|Legacy indicators are not validated species probabilities, vessel-specific fuel consumption or CO₂ calculations. The raw NASA product, years and exact coverage have not been supplied.
Klorofil-a oranı klasik modelin orta risk eşiğinde. Bu sınıf, gözlenmiş balina konumu veya türlere özgü habitat tahmini değildir.|The chlorophyll-a ratio reaches the legacy model's moderate threshold. This classification is not an observed whale position or species-specific habitat prediction.
Klorofil-a oranı klasik modelin kritik eşiğinde. Bu sınıf, doğrulanmış çarpışma olasılığı değildir.|The chlorophyll-a ratio reaches the legacy model's critical threshold. This classification is not a validated collision probability.

İki geçiş noktasıyla başlayın.|Start with two waypoints.
Araçlar|Explore tools
Platform|Platform
Kayıtlar|Records
Veri|Data
Okyanusta sudan sıçrayan balina|A whale breaching in the ocean
Onların okyanusu.|Their ocean.
Bizim rotamız.|Our course.
Balinaları gözeten rota analizi.|Route intelligence. With whales in mind.
Rotanı planla|Plan your voyage
Riski analiz et|Analyze risk
Çalışma alanlarını keşfet|Explore the workspace
ANTARKTİKA / GÜNEY OKYANUSU|ANTARCTICA / SOUTHERN OCEAN
01 / ÇALIŞMA ALANI|01 / WORKSPACE
Okyanusu oku.|Read the ocean.
Sefer kayıtları|Voyage records
Analiz bekleniyor|Awaiting analysis

İçeriğe geç|Skip to content
W-ALERTER ana sayfa|W-ALERTER home
Ana menü|Main navigation
Keşfet|Overview
Çalışma alanı|Workspace
Kayıtlarım|Records
Veri & yöntem|Data & methodology
Arşiv temelli analiz|Archive-based analysis
Kullanım rehberi|Platform guide
Platforma geç|Open platform
Menüyü aç|Open navigation
Arayüz dili|Interface language
Türkçe dilini seç|Switch to Turkish
İngilizce dilini seç|Switch to English
W-ALERTER’ı keşfet|Explore W-ALERTER
DENİZ EKOSİSTEMİ İÇİN KARAR DESTEĞİ|DECISION SUPPORT FOR MARINE ECOSYSTEMS
Deniz yaşamını gözeten|Marine-aware
rota zekâsı.|route intelligence.
Klorofil-a gözlemlerini mevsimsel referanslarla karşılaştırın. Bölgesel riski değerlendirin, seferlerinizi planlayın ve analizlerinizi tek çalışma alanında yönetin.|Compare chlorophyll-a observations against seasonal references. Assess regional risk, plan voyages and manage your analyses in one workspace.
Çalışma alanını aç|Open workspace
Veri ve yöntemi incele|Explore the methodology
Klorofil-a arşiv referansları|Chlorophyll-a archive references
Antarktika|Antarctica
ANTARKTİKA|ANTARCTICA
Güney Okyanusu çalışma bölgesi|Southern Ocean study area
Antarktika çalışma bölgesi haritası|Map of the Antarctic study area
Okyanus haritası|Ocean basemap
ÇALIŞMA BÖLGESİ|STUDY AREA
Okyanusun mevsimsel hafızası.|Seasonal ocean reference data.
Klorofil-a · Aylık arşiv referansları|Chlorophyll-a · Monthly archive references
Veri ve yöntem sayfasını aç|Open data and methodology
BÜTÜNLEŞİK ANALİZ ARAÇLARI|INTEGRATED ANALYSIS TOOLS
Gözlemlerden|From observations to
ölçülebilir sonuçlara.|measurable insights.
Mevsimsel referanslar, konum analizi ve sefer planı. Deniz ekosistemini gözetmek için ihtiyacınız olan araçlar, aynı rotada.|Seasonal references, location analysis and voyage planning. A connected set of tools for marine-aware decisions.
Bölgesel risk analizi|Regional risk analysis
Klorofil-a ölçümünü aylık referansla karşılaştır; bölgenin risk sınıfını ve model göstergesini birlikte gör.|Compare chlorophyll-a measurements against monthly references and review the regional risk class alongside the model indicator.
Çok noktalı sefer planlama|Multi-point voyage planning
Geçiş noktalarını düzenle, etapların riskini ve mesafesini incele. Yakıt tasarrufu tahminini hesapla.|Organize waypoints, review risk and distance for each leg, and calculate estimated fuel savings.
Kayıt ve raporlama|Records and reporting
Seferlerini adlandır ve kaydet. Gözlemlerine geri dön; rota dosyalarını ve raporlarını yanında götür.|Name and save voyages, revisit observations, and export route files and reports.
GÖZLEMDEN SEFER RAPORUNA|FROM OBSERVATION TO VOYAGE REPORT
Seferinizi verilerle değerlendirin.|Assess your voyage with data.
Yeni gözlem oluştur|Create an observation
Okyanus için tasarlandı.|Designed for the ocean.
Gözlem. Farkındalık. Koruma.|Observe. Understand. Protect.
Sefer çalışma alanı|Voyage workspace
ANTARKTİKA / SEFER ÇALIŞMA ALANI|ANTARCTICA / VOYAGE WORKSPACE
Bölgesel keşif|Regional analysis
Rotanın hikâyesi|Voyage planning
Risk analizi|Risk analysis
Sefer planlama|Voyage planning
Çalışma modu|Workspace mode
Konum analizi|Location analysis
Rota planlayıcı|Voyage planner
Taslak hazır|Draft ready
Rota dosyası içe aktar|Import a route file
İçe aktar|Import
Rotayı kaydet|Save voyage
01 / GÖZLEM|01 / OBSERVATION
Yeni bir perspektif.|Location analysis
Bir konum seçin, ölçümünüzü anlamlandırın.|Select a location and evaluate your measurement.
Gözlem periyodu|Observation period
Ekim|October
Kasım|November
Aralık|December
Ocak|January
EKİM|OCTOBER
KASIM|NOVEMBER
ARALIK|DECEMBER
OCAK|JANUARY
Aylık referans|Monthly reference
Enlem|Latitude
Boylam|Longitude
Klorofil-a ölçümü|Chlorophyll-a measurement
Uydu veya sensör ölçümünüzü girin.|Enter a satellite or sensor measurement.
Konumu analiz et|Analyze location
Analiz sonucu bekleniyor|Awaiting analysis
Okyanus bize ne söylüyor?|Awaiting analysis
İlk gözleminizle bölgesel risk durumunu keşfedin. Sonuçlarınız burada görünecek.|Run an observation analysis to review regional risk and the model indicator here.
Referanslar sabit. Gözlemler sizin.|Fixed references. Your observations.
ANALİZ SONUCU|ANALYSIS RESULT
Balina geçiş göstergesi|Whale passage indicator
Model tahmini|Model estimate
Referansa oran|Reference ratio
Gözlem|Observation
Arşiv referansı|Archive reference
Rotaya geçiş noktası ekle|Add waypoint to voyage
02 / SEFER PLANI|02 / VOYAGE PLAN
Sefer planı|Voyage plan
Rotanı şekillendir.|Voyage plan
Her geçiş noktası bir sonraki kararınız.|Define waypoints and evaluate each voyage leg.
Sefer adı|Voyage name
Seferinize bir ad verin|Name your voyage
Sefer ayı|Voyage month
Geçiş noktası ekle|Add a waypoint
Vazgeç|Cancel
Klorofil-a|Chlorophyll-a
Ölçüm değeri|Measurement
Noktayı ekle|Add waypoint
Geçiş noktaları|Waypoints
Temizle|Clear
Rotayı analiz et|Analyze voyage
Taslağınız bu tarayıcıda otomatik kaydedilir.|Your draft is saved automatically in this browser.
Konum analizi haritası|Location analysis map
Rota planlama haritası|Voyage planning map
Harita katmanı|Map layer
Okyanus|Ocean
Harita|Map
GÜNEY OKYANUSU|SOUTHERN OCEAN
Haritayı merkezle|Center map
Haritayı yakınlaştır|Zoom in
Haritayı uzaklaştır|Zoom out
Haritaya tıklayarak konum seçin|Click the map to select a location
Konum seçin · Geçiş noktalarını sürükleyerek taşıyın|Select a location · Drag waypoints to reposition
Normal|Normal
Normal seyir|Normal conditions
Orta risk|Moderate risk
Kritik risk|Critical risk
SEÇİLİ GÖZLEM|SELECTED OBSERVATION
TOPLAM MESAFE|TOTAL DISTANCE
RİSKLİ ETAPLAR|AT-RISK LEGS
YAKIT TASARRUFU TAHMİNİ|ESTIMATED FUEL SAVINGS
HEDEF HIZ PARAMETRESİ|TARGET SPEED PARAMETER
%28.5 yavaşlama · 2.5 L/NM|28.5% speed reduction · 2.5 L/NM
ETAP ETAP DEĞERLENDİRME|LEG-BY-LEG ASSESSMENT
Etap değerlendirmesi|Voyage leg assessment
Rotanın anatomisi.|Voyage leg assessment
Rapor indir|Download report
Etap|Leg
Varış koordinatı|Arrival coordinates
Mesafe|Distance
Değerlendirme|Assessment
Etap riski varış noktasına göre hesaplanır. Rota, eklediğiniz noktaları sırasıyla birleştirir.|Each leg is classified using its arrival waypoint. The route connects your waypoints in order.
ÇALIŞMAYA DEVAM ET|RECENT ACTIVITY
Son gözlemler|Recent observations
Son gözlemlerin.|Recent observations
Tüm kayıtlar|All records
Arşiv referansları|Archive references
Veri & hesaplama yöntemi|Data & calculation method
SİZİN ÇALIŞMA ALANINIZ|YOUR WORKSPACE
Sefer kayıtları|Saved voyages
ve gözlem geçmişi.|and observation history.
Yeni sefer oluştur|Create a voyage
Kayıtlarınız bu tarayıcıda saklanır.|Your records are stored in this browser.
Rotalarınızı JSON olarak yedekleyebilir, başka bir tarayıcıda yeniden içe aktarabilirsiniz.|Back up your voyages as JSON and import them into another browser.
Kayıtlı seferler|Saved voyages
Gözlem geçmişi|Observation history
Kayıtlarda ara|Search records
Kayıtlarda ara...|Search records...
CSV indir|Download CSV
Yeni bir gözlem oluştur|Create a new observation
ŞEFFAF VERİ. ANLAŞILIR YÖNTEM.|TRANSPARENT DATA. CLEAR METHODOLOGY.
Veri kaynakları|Data sources
ve hesaplama yöntemi.|and calculation methodology.
Bir ölçümü karşılaştır|Compare a measurement
W-ALERTER arşivinde yer alan dört aylık klorofil-a referansı. Değerler, gözlem ölçümlerinin karşılaştırıldığı baz hattını oluşturur.|Four monthly chlorophyll-a references from the W-ALERTER archive form the baseline for comparing observations.
yıllık arşiv referansı|years of archive reference
Aylık referanslar|Monthly references
KLOROFİL-a / mg/m³|CHLOROPHYLL-a / mg/m³
Arşiv referansları, gözlem ölçümlerinden ayrı tutulur.|Archive references are kept separate from observation measurements.
01 / KONUM MODELİ|01 / LOCATION MODEL
Ölçüm bir bağlam kazanır.|Measurement in context.
Gözlemin klorofil-a değeri, seçilen ayın referansına bölünür. Bu oran, mevcut W-ALERTER modelinin risk sınıfını belirler.|The observed chlorophyll-a value is divided by the selected month's reference. This ratio determines the risk class in the existing W-ALERTER model.
Oran = gözlem / aylık referans|Ratio = observation / monthly reference
oran < 1.25|ratio < 1.25
1.25 ≤ oran < 1.8|1.25 ≤ ratio < 1.8
oran ≥ 1.8|ratio ≥ 1.8
Geçiş göstergesi, mevcut modelde oran × 50 olarak hesaplanır ve %99.8 ile sınırlanır. Oran 0.5’in altındaysa oran × 18 kullanılır. Bu gösterge, model tahminidir.|The passage indicator uses ratio × 50, capped at 99.8%. For ratios below 0.5, ratio × 18 is used. This indicator is a model estimate.
02 / ROTA MODELİ|02 / VOYAGE MODEL
Her etabın bir karşılığı var.|A consistent assessment for every leg.
Geçiş noktaları arasındaki mesafe Haversine formülüyle, R = 3440 NM alınarak hesaplanır. Varış noktasının oranı 1.25 veya üzerindeyse etabın tamamı riskli mesafeye eklenir.|Waypoint distance is calculated with the Haversine formula using R = 3440 NM. If the arrival waypoint ratio is 1.25 or greater, the full leg is included in the at-risk distance.
Riskli mesafe × 2.5|At-risk distance × 2.5
Modelde kullanılan seyir parametreleri: 10 knot hedef hız ve %28.5 yavaşlama.|Model voyage parameters: target speed of 10 knots and a 28.5% speed reduction.
Kaydetme penceresini kapat|Close save dialog
BİR SONRAKİ SEFERE|SAVE YOUR WORK
Seferi kaydet|Save voyage
Bu seferi kaydedin, daha sonra aynı yerden devam edin.|Save this voyage and continue from the same point later.
Örn. Antarktika gözlem seferi|e.g. Antarctic observation voyage
Kayıt bu tarayıcıda saklanır.|This record is stored in your browser.
Rehberi kapat|Close guide
PLATFORM REHBERİ|PLATFORM GUIDE
Platformu|Start using
kullanmaya başlayın.|the platform.
Konumunu belirle.|Select a location.
Haritaya tıkla veya koordinatları gir.|Click the map or enter coordinates.
Ölçümü karşılaştır.|Compare your measurement.
Ayı seç, klorofil-a ölçümünü gir ve analizi başlat.|Select a month, enter chlorophyll-a and run the analysis.
Rotanı oluştur.|Plan your voyage.
En az iki nokta ekle. Noktaları düzenle, sırala veya haritada sürükle.|Add at least two waypoints. Edit, reorder or drag them on the map.
Çalışmanı yanında götür.|Export your work.
Seferini kaydet veya JSON, GPX ve rapor olarak indir.|Save your voyage or export JSON, GPX and a report.
Geri al|Undo
Bu tarayıcıda kaydedildi|Saved in this browser
Kaydedilemedi|Unable to save
Bu tarayıcı taslağı kaydedemiyor. Rotanızı JSON olarak yedekleyin.|This browser cannot save the draft. Back up your voyage as JSON.
Son taslağınız bu tarayıcıda saklanıyor.|Your latest draft is stored in this browser.
Tarayıcı depolaması kullanılamıyor. JSON olarak dışa aktarın.|Browser storage is unavailable. Export your voyage as JSON.
Her rota, bir yaşam.|Marine risk intelligence
Deniz ekosistemi için rota analizi|Marine-aware route intelligence
Harita katmanı yüklenemiyor. Diğer katmanı deneyebilir veya koordinat girerek çalışabilirsiniz.|The map layer is unavailable. Try the other layer or continue by entering coordinates.
Harita yüklenemedi. Koordinat girerek çalışmaya devam edebilirsiniz.|The map could not load. Continue by entering coordinates.
Konum seçildi. Klorofil-a ölçümünü girerek noktayı ekleyin.|Location selected. Enter a chlorophyll-a measurement to add the waypoint.
Gözlem hesaplandı; bu tarayıcı geçmişi kaydedemiyor.|Observation calculated; this browser cannot save the history.
Klorofil-a oranı risk eşiklerinin altında. Bölgesel izleme ve standart seyir değerlendirmesini sürdürün.|The chlorophyll-a ratio is below the risk thresholds. Continue regional monitoring and standard voyage assessment.
Klorofil-a baz hattının üzerinde. Aktif bir beslenme zonu oluşmuş olabilir. Gözcüleri uyarın ve rotayı değerlendirin.|Chlorophyll-a is above the baseline. An active feeding zone may be present. Alert lookouts and assess the voyage.
Klorofil-a baz hattının belirgin üzerinde. Bölgeyi rota bazlı analiz edin; geçişinizi dikkatle değerlendirin.|Chlorophyll-a is substantially above the baseline. Assess the region within your voyage and review the passage carefully.
Bir sefer en fazla 1000 geçiş noktası içerebilir.|A voyage can contain up to 1,000 waypoints.
Bir sefer en fazla 1000 nokta içerebilir.|A voyage can contain up to 1,000 waypoints.
Değişiklikleri uygula|Apply changes
Geçiş noktası kaldırıldı.|Waypoint removed.
Riskli|At risk
Güvenli|Normal
Güvenli nokta|Normal waypoint
Riskli nokta|At-risk waypoint
Geçerli koordinat aralığında bir konum seçin.|Select a location within the valid coordinate range.
Riskli etap|At-risk leg
Normal etap|Normal leg
Rota analiz edildi. Etap değerlendirmesi haritanın altında.|Voyage analyzed. Review the leg assessment below the map.
Gözlemi aç|Open observation
Gözlem geçmişiniz ilk analizle oluşacak.|Your first analysis will create the observation history.
Verileriniz bu tarayıcıda saklanır.|Your data is stored in this browser.
Kaydedilen rota çizimi|Saved route overview
Son kayıt|Last saved
GEÇİŞ NOKTASI|WAYPOINTS
MESAFE|DISTANCE
RİSKLİ MESAFE|AT-RISK DISTANCE
Seferi aç|Open voyage
Aradığınız sefer bulunamadı.|No matching voyages found.
Bir sonraki sefer burada başlar.|Your next voyage starts here.
Farklı bir sefer adı veya ay deneyin.|Try another voyage name or month.
İlk rotanızı oluşturun, adlandırın ve kaydedin. Sonraki ziyaretinizde kaldığınız yerden devam edin.|Create, name and save your first voyage. Continue where you left off on your next visit.
Sefer oluştur|Create voyage
Tarih|Date
Konum|Location
Ay|Month
Risk sınıfı|Risk class
İşlem|Action
Aç|Open
Eşleşen gözlem yok.|No matching observations.
Okyanusun ilk izini bırak.|Create your first observation.
Arama ölçütünüzü değiştirmeyi deneyin.|Try a different search term.
Konum analizi yaptığınızda gözlemleriniz burada birikir. Her gözleme yeniden dönebilirsiniz.|Your location analyses are stored here. Reopen any observation to review its results.
İlk gözlemini oluştur|Create an observation
Seferiniz kaydedildi. Kayıtlarım bölümünden yeniden açabilirsiniz.|Voyage saved. Reopen it from Records.
Rota JSON olarak indirildi. Bu dosyayı yeniden içe aktarabilirsiniz.|Voyage exported as JSON. You can import this file again.
Geçiş noktaları GPX olarak indirildi.|Waypoints exported as GPX.
Henüz dışa aktarılacak gözlem yok.|No observations are available for export yet.
Gözlem geçmişi CSV olarak indirildi.|Observation history exported as CSV.
Dosya çok büyük. En fazla 2 MB boyutunda bir rota seçin.|This file is too large. Select a route file up to 2 MB.
Rota içe aktarıldı. Kaydetmek için seferinize bir ad verin.|Voyage imported. Give it a name to save it.
Gözleminiz rotaya geçiş noktası olarak eklendi.|Observation added as a voyage waypoint.
Yeni bir sefer taslağı hazır.|A new voyage draft is ready.
Kaydedilen sefer kaldırıldı.|Saved voyage removed.
Sefer silinemedi. Tarayıcı depolamasını kontrol edin.|Could not remove the voyage. Check browser storage.
Sefer taslağının noktaları temizlendi.|The draft waypoints have been cleared.
Geçiş noktalarını kontrol edin. Enlem, boylam ve klorofil-a sayısal olmalıdır.|Check the waypoints. Latitude, longitude and chlorophyll-a must be numeric.
Dosyada geçerli bir sefer ayı bulunamadı.|The file does not contain a valid voyage month.
Bu tarayıcı kayıt yapamıyor. Rotayı JSON olarak indirebilirsiniz.|This browser cannot save records. Export the voyage as JSON instead.
Dosya okunamadı. W-ALERTER JSON dosyası seçin.|The file could not be read. Select a W-ALERTER JSON file.
Bu dosya W-ALERTER rota biçiminde değil.|This file is not in the W-ALERTER route format.
Sefer raporu indirildi. Raporu açıp PDF olarak da kaydedebilirsiniz.|Voyage report exported. Open it to print or save as PDF.
SEFER ANALİZ RAPORU|VOYAGE ANALYSIS REPORT
W-ALERTER Sefer Raporu|W-ALERTER Voyage Report
Yazdır / PDF olarak kaydet|Print / Save as PDF
Geçiş noktaları ve etaplar|Waypoints and voyage legs
Nokta|Waypoint
Klorofil-a (mg/m³)|Chlorophyll-a (mg/m³)
Klorofil-a (mg/m3)|Chlorophyll-a (mg/m3)
Önceki etap (NM)|Previous leg (NM)
Nokta riski|Waypoint risk
Veri ve yöntem|Data and methodology
klorofil-a referansı:|chlorophyll-a reference:
W-ALERTER referans arşivi.|W-ALERTER reference archive.
Geçiş noktası oranı 1.25 ve üzerindeyse riskli kabul edilir. Etabın risk durumu varış noktasına göre hesaplanır.|A waypoint is considered at risk when its ratio is 1.25 or higher. Leg risk is based on its arrival waypoint.
Mesafe: Haversine, R = 3440 NM. Yakıt tasarrufu tahmini: riskli mesafe × 2.5 L/NM. Modelin hedef hız parametresi 10 knot, yavaşlama oranı %28.5’tir. Rota, girilen noktaları sırasıyla birleştirir.|Distance: Haversine, R = 3440 NM. Estimated fuel savings: at-risk distance × 2.5 L/NM. Model target speed: 10 knots; speed reduction: 28.5%. The route connects entered waypoints in order.
Bu rapor kullanıcı ölçümleri ve mevcut W-ALERTER modeli ile üretilmiştir.|This report was generated using user measurements and the existing W-ALERTER model.
seferini sil|delete voyage
geçiş noktası|waypoints
dönemi|period
Referans|Reference
Oran|Ratio
Risk|Risk
Model göstergesi (%)|Model indicator (%)
knot|knots
Ekim ayını analiz et|Analyze October
Kasım ayını analiz et|Analyze November
Aralık ayını analiz et|Analyze December
Ocak ayını analiz et|Analyze January
`.trim().split('\n').map(line=>{const i=line.indexOf('|');return [line.slice(0,i),line.slice(i+1)];});

const dictionary=Object.fromEntries(pairs.filter(([key])=>key));
const LANGUAGES=Object.freeze({tr:{name:'Türkçe',locale:'tr-TR'},en:{name:'English',locale:'en-GB'},de:{name:'Deutsch',locale:'de-DE'},fr:{name:'Français',locale:'fr-FR'},es:{name:'Español',locale:'es-ES'}});
const resources=typeof WA_TRANSLATIONS==='undefined'?{}:WA_TRANSLATIONS;
let language='tr';try{const query=new URLSearchParams(location.search).get('lang'),saved=localStorage.getItem('w-alerter.language');language=Object.hasOwn(LANGUAGES,query)?query:Object.hasOwn(LANGUAGES,saved)?saved:'tr';}catch{}
const textCache=new WeakMap(),attrCache=new WeakMap();let observer,pending=false;
function english(value){
  if(language==='tr'||language==='en')return value;
  const raw=String(value),core=raw.trim(),lead=raw.match(/^\s*/)[0],tail=raw.match(/\s*$/)[0],translations=resources[language]||{};
  if(Object.hasOwn(translations,core))return lead+translations[core]+tail;
  return lead+core.replace(englishPattern,key=>translations[key]??key)+tail;
}
function message(tr,en){return language==='tr'?tr:english(en);}
function escapeRegex(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
const englishKeys=Object.keys(resources.de||{}).sort((a,b)=>b.length-a.length);
const englishPattern=new RegExp('(?<![\\p{L}])(?:'+englishKeys.map(escapeRegex).join('|')+')(?![\\p{L}])','gu');
const keys=Object.keys(dictionary).sort((a,b)=>b.length-a.length);
const substitutionPattern=new RegExp('(?<![\\p{L}])(?:'+keys.map(escapeRegex).join('|')+')(?![\\p{L}])','gu');
const patterns=[[/^(\d+)\. noktayı yukarı taşı$/,'Move waypoint $1 up'],[/^(\d+)\. noktayı aşağı taşı$/,'Move waypoint $1 down'],[/^(\d+)\. noktayı düzenle$/,'Edit waypoint $1'],[/^(\d+)\. noktayı sil$/,'Remove waypoint $1'],[/^Geçiş noktası (\d+)$/,'Waypoint $1'],[/^Nokta (\d+)/,'Waypoint $1']];
function translate(value){
  if(language==='tr')return value;
  const raw=String(value),core=raw.trim().replace(/\s+/g,' '),lead=raw.match(/^\s*/)[0],tail=raw.match(/\s*$/)[0];if(!core)return raw;
  if(Object.hasOwn(dictionary,core))return lead+english(dictionary[core])+tail;
  for(const [re,replacement]of patterns)if(re.test(core))return lead+core.replace(re,english(replacement))+tail;
  const output=core.replace(substitutionPattern,from=>english(dictionary[from])).replace(/(\d+\.\d+°) ([GKBD])(?=\s|$)/g,(_,n,d)=>n+' '+({G:'S',K:'N',B:'W',D:'E'}[d]));
  return lead+output+tail;
}
function excluded(el){return el.closest('script,style,[data-user-content],.leaflet-tile-pane');}
function apply(root=document){
  if(observer)observer.disconnect();
  root.querySelectorAll('select option').forEach(option=>{if(!option.hasAttribute('value'))option.value=option.textContent.trim();});
  const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
  while(node=walk.nextNode()){
    if(!node.parentElement||excluded(node.parentElement))continue;
    let record=textCache.get(node);if(!record||node.data!==record.rendered)record={source:node.data,rendered:node.data};
    const next=translate(record.source);if(node.data!==next)node.data=next;record.rendered=next;textCache.set(node,record);
  }
  root.querySelectorAll('[aria-label],[title],[placeholder],[alt]').forEach(el=>{
    if(excluded(el))return;let records=attrCache.get(el)||{};
    for(const attr of['aria-label','title','placeholder','alt']){
      if(!el.hasAttribute(attr))continue;const value=el.getAttribute(attr);let r=records[attr];if(!r||value!==r.rendered)r={source:value,rendered:value};
      const next=translate(r.source);if(next!==value)el.setAttribute(attr,next);r.rendered=next;records[attr]=r;
    }attrCache.set(el,records);
  });
  document.documentElement.lang=language;
  const description=document.querySelector('meta[name="description"]');if(description)description.content=message('W-ALERTER ile klorofil-a gözlemlerini aylık referanslarla karşılaştırın, bölgesel riski değerlendirin ve seferlerinizi planlayın.','Compare chlorophyll-a observations against monthly references, assess regional risk and plan your voyages with W-ALERTER.');
  document.querySelectorAll('[data-language-select]').forEach(select=>select.value=language);
  if(observer)observe();pending=false;
}
function observe(){observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder','alt']});}
function setLanguage(next){
  if(!Object.hasOwn(LANGUAGES,next))return;language=next;
  try{localStorage.setItem('w-alerter.language',next);}catch{}
  try{const url=new URL(location.href);url.searchParams.set('lang',next);history.replaceState(null,'',url);}catch{}
  apply();window.dispatchEvent(new CustomEvent('languagechange',{detail:{language}}));apply();
}
function translateHTML(html){
  const doc=new DOMParser().parseFromString(html,'text/html');const walker=doc.createTreeWalker(doc,NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode())if(node.parentElement&&!excluded(node.parentElement))node.data=translate(node.data);
  doc.documentElement.lang=language;return '<!doctype html>'+doc.documentElement.outerHTML;
}
function init(){document.querySelectorAll('[data-language-select]').forEach(select=>select.addEventListener('change',()=>setLanguage(select.value)));apply();observer=new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>apply());});observe();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
return {translate,translateHTML,setLanguage,message,english,languages:LANGUAGES,get language(){return language;},get locale(){return LANGUAGES[language].locale;},dictionary};
})();
