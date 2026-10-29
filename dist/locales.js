'use strict';
/* Curated interface translations: English key, German, French, Spanish. Scientific measurements are not translated. */
const WA_TRANSLATIONS = (()=>{
const rows = [
  ["SHARED DATA CATALOGUE","GEMEINSAMER DATENKATALOG","CATALOGUE DE DONNÉES PARTAGÉ","CATÁLOGO DE DATOS COMPARTIDO"],
  ["Fuel & carbon","Kraftstoff & CO₂","Carburant & CO₂","Combustible y CO₂"],
  [
    "The legacy indicator is ratio × 50, capped at 99.8%. Ratios below 0.5 use ratio × 18. This indicator is not a validated whale probability.",
    "Der bisherige Indikator ist Verhältnis × 50, begrenzt auf 99.8%. Unter 0.5 gilt Verhältnis × 18. Dies ist keine validierte Wahrscheinlichkeit einer Walpassage.",
    "L’indicateur classique vaut rapport × 50, plafonné à 99.8%. Sous 0.5, le calcul utilise rapport × 18. Ce n’est pas une probabilité validée de présence de baleines.",
    "El indicador clásico es relación × 50, con un límite de 99.8%. Por debajo de 0.5 se usa relación × 18. No es una probabilidad validada de presencia de ballenas."
  ],
  [
    "Data centre",
    "Datenzentrum",
    "Centre de données",
    "Centro de datos"
  ],
  [
    "Platform modules",
    "Plattformmodule",
    "Modules de la plateforme",
    "Módulos de la plataforma"
  ],
  [
    "Legacy analysis",
    "Bisherige Analyse",
    "Analyse classique",
    "Análisis clásico"
  ],
  [
    "North Atlantic",
    "Nordatlantik",
    "Atlantique Nord",
    "Atlántico Norte"
  ],
  [
    "Species models",
    "Artenmodelle",
    "Modèles par espèce",
    "Modelos por especie"
  ],
  [
    "Legacy model · Antarctic references. This is not a species-specific habitat prediction.",
    "Bisheriges Modell · Antarktische Referenzen. Keine artspezifische Habitatprognose.",
    "Modèle classique · Références antarctiques. Ce n’est pas une prédiction d’habitat propre à une espèce.",
    "Modelo clásico · Referencias antárticas. No es una predicción de hábitat específica de una especie."
  ],
  [
    "Explore the method ↗",
    "Methode ansehen ↗",
    "Consulter la méthode ↗",
    "Consultar el método ↗"
  ],
  [
    "Legacy model indicator",
    "Bisheriger Modellindikator",
    "Indicateur du modèle classique",
    "Indicador del modelo clásico"
  ],
  [
    "Not a validated probability",
    "Keine validierte Wahrscheinlichkeit",
    "Probabilité non validée",
    "Probabilidad no validada"
  ],
  [
    "LEGACY FUEL INDICATOR",
    "BISHERIGER KRAFTSTOFFINDIKATOR",
    "INDICATEUR CLASSIQUE DE CARBURANT",
    "INDICADOR CLÁSICO DE COMBUSTIBLE"
  ],
  [
    "Source metadata ↗",
    "Quellenmetadaten ↗",
    "Métadonnées de la source ↗",
    "Metadatos de la fuente ↗"
  ],
  [
    "The four monthly references attributed to NASA MODIS-Aqua in the supplied source are preserved. The raw file, product ID, years and exact geographic coverage have not been supplied.",
    "Die vier monatlichen Referenzen, die im bereitgestellten Quellcode NASA MODIS-Aqua zugeordnet sind, bleiben erhalten. Rohdatei, Produktkennung, Jahre und genaue räumliche Abdeckung fehlen.",
    "Les quatre références mensuelles attribuées à NASA MODIS-Aqua dans le code fourni sont conservées. Le fichier brut, l’identifiant du produit, les années et la couverture géographique exacte n’ont pas été fournis.",
    "Se conservan las cuatro referencias mensuales atribuidas a NASA MODIS-Aqua en el código proporcionado. No se han facilitado el archivo original, el identificador del producto, los años ni la cobertura geográfica exacta."
  ],
  [
    "This indicator is not a validated whale probability.",
    "Dieser Indikator ist keine validierte Wahrscheinlichkeit einer Walpassage.",
    "Cet indicateur n’est pas une probabilité validée de présence de baleines.",
    "Este indicador no es una probabilidad validada de presencia de ballenas."
  ],
  [
    "Legacy model constants: 10 knots, 28.5%, 2.5 L/NM. This is not a vessel-specific fuel or CO₂ calculation.",
    "Konstanten des bisherigen Modells: 10 Knoten, 28.5%, 2.5 L/NM. Keine schiffsspezifische Kraftstoff- oder CO₂-Berechnung.",
    "Constantes du modèle classique : 10 nœuds, 28.5%, 2.5 L/NM. Ce n’est pas un calcul de carburant ou de CO₂ propre à un navire.",
    "Constantes del modelo clásico: 10 nudos, 28.5%, 2.5 L/NM. No es un cálculo de combustible o CO₂ específico de un buque."
  ],
  [
    "W—A / DATA INFRASTRUCTURE",
    "W—A / DATENINFRASTRUKTUR",
    "W—A / INFRASTRUCTURE DE DONNÉES",
    "W—A / INFRAESTRUCTURA DE DATOS"
  ],
  [
    "Known sources.",
    "Bekannte Quellen.",
    "Sources identifiées.",
    "Fuentes identificadas."
  ],
  [
    "Clear limits.",
    "Klare Grenzen.",
    "Limites explicites.",
    "Límites claros."
  ],
  [
    "Every layer, with its source.",
    "Jede Ebene mit ihrer Quelle.",
    "Chaque couche, avec sa source.",
    "Cada capa, con su fuente."
  ],
  [
    "Legacy methodology ↗",
    "Bisherige Methodik ↗",
    "Méthode classique ↗",
    "Metodología clásica ↗"
  ],
  [
    "01 / EXISTING REFERENCE",
    "01 / BESTEHENDE REFERENZ",
    "01 / RÉFÉRENCE EXISTANTE",
    "01 / REFERENCIA EXISTENTE"
  ],
  [
    "Preserved from the source",
    "Aus dem Quellcode erhalten",
    "Conservé depuis le code source",
    "Conservado del código fuente"
  ],
  [
    "Chlorophyll-a · Four monthly legacy references · mg/m³",
    "Chlorophyll-a · Vier monatliche Bestandsreferenzen · mg/m³",
    "Chlorophylle-a · Quatre références mensuelles classiques · mg/m³",
    "Clorofila-a · Cuatro referencias mensuales clásicas · mg/m³"
  ],
  [
    "The raw satellite file is not in this project.",
    "Die Satelliten-Rohdatei fehlt in diesem Projekt.",
    "Le fichier satellite brut ne figure pas dans ce projet.",
    "El archivo satelital original no está en este proyecto."
  ],
  [
    "Source details ↗",
    "Quellendetails ↗",
    "Détails de la source ↗",
    "Detalles de la fuente ↗"
  ],
  [
    "New data layers",
    "Neue Datenebenen",
    "Nouvelles couches de données",
    "Nuevas capas de datos"
  ],
  [
    "INTEGRATION PLAN",
    "INTEGRATIONSPLAN",
    "PLAN D’INTÉGRATION",
    "PLAN DE INTEGRACIÓN"
  ],
  [
    "02 / FILE INTAKE",
    "02 / DATEIAUFNAHME",
    "02 / IMPORT DE FICHIERS",
    "02 / RECEPCIÓN DE ARCHIVOS"
  ],
  [
    "Make room for data.",
    "Raum für Daten.",
    "Place aux données.",
    "Espacio para los datos."
  ],
  [
    "Record the source, time and coverage.",
    "Quelle, Zeit und Abdeckung erfassen.",
    "Consignez la source, la période et la couverture.",
    "Registra la fuente, el período y la cobertura."
  ],
  [
    "Inspect a file",
    "Datei prüfen",
    "Examiner un fichier",
    "Inspeccionar un archivo"
  ],
  [
    "Only W-ALERTER JSON packages with metadata can currently be saved. Other formats require a file-specific adapter.",
    "Derzeit können nur W-ALERTER-JSON-Pakete mit Metadaten gespeichert werden. Andere Formate benötigen einen dateispezifischen Adapter.",
    "Seuls les paquets JSON W-ALERTER avec métadonnées peuvent être enregistrés actuellement. Les autres formats nécessitent un adaptateur propre au fichier.",
    "Actualmente solo se pueden guardar paquetes JSON de W-ALERTER con metadatos. Los demás formatos requieren un adaptador específico."
  ],
  [
    "No file selected yet.",
    "Noch keine Datei ausgewählt.",
    "Aucun fichier sélectionné.",
    "Aún no se ha seleccionado un archivo."
  ],
  [
    "Accept technical checks and save",
    "Technische Prüfung akzeptieren und speichern",
    "Accepter les contrôles techniques et enregistrer",
    "Aceptar la comprobación técnica y guardar"
  ],
  [
    "No scientific approval is granted. Storage is local to this browser.",
    "Keine wissenschaftliche Freigabe. Die Speicherung erfolgt nur in diesem Browser.",
    "Aucune validation scientifique n’est accordée. Le stockage est local à ce navigateur.",
    "No se concede validación científica. El almacenamiento es local en este navegador."
  ],
  [
    "LOCAL DATA CATALOGUE",
    "LOKALER DATENKATALOG",
    "CATALOGUE LOCAL DE DONNÉES",
    "CATÁLOGO LOCAL DE DATOS"
  ],
  [
    "Map workspace ↗",
    "Kartenarbeitsbereich ↗",
    "Espace cartographique ↗",
    "Área de trabajo del mapa ↗"
  ],
  [
    "W—A / NORTH ATLANTIC",
    "W—A / NORDATLANTIK",
    "W—A / ATLANTIQUE NORD",
    "W—A / ATLÁNTICO NORTE"
  ],
  [
    "The ocean.",
    "Der Ozean.",
    "L’océan.",
    "El océano."
  ],
  [
    "Layer by layer.",
    "Ebene für Ebene.",
    "Couche par couche.",
    "Capa a capa."
  ],
  [
    "DATA WORKSPACE",
    "DATENARBEITSBEREICH",
    "ESPACE DE DONNÉES",
    "ÁREA DE DATOS"
  ],
  [
    "Only measurements with a source.",
    "Nur Messwerte mit Quellenangabe.",
    "Uniquement des mesures sourcées.",
    "Solo mediciones con una fuente."
  ],
  [
    "Open data centre ↗",
    "Datenzentrum öffnen ↗",
    "Ouvrir le centre de données ↗",
    "Abrir el centro de datos ↗"
  ],
  [
    "LAYER SELECTION",
    "EBENENAUSWAHL",
    "SÉLECTION DES COUCHES",
    "SELECCIÓN DE CAPAS"
  ],
  [
    "From source to map.",
    "Von der Quelle zur Karte.",
    "De la source à la carte.",
    "De la fuente al mapa."
  ],
  [
    "Dataset",
    "Datensatz",
    "Jeu de données",
    "Conjunto de datos"
  ],
  [
    "Variable and unit",
    "Variable und Einheit",
    "Variable et unité",
    "Variable y unidad"
  ],
  [
    "Measurement time (UTC)",
    "Messzeit (UTC)",
    "Heure de mesure (UTC)",
    "Hora de medición (UTC)"
  ],
  [
    "Missing measurements are not plotted. No interpolation or habitat prediction is performed.",
    "Fehlende Messwerte werden nicht dargestellt. Es erfolgt keine Interpolation oder Habitatprognose.",
    "Les mesures manquantes ne sont pas affichées. Aucune interpolation ni prédiction d’habitat n’est effectuée.",
    "Las mediciones ausentes no se representan. No se realiza interpolación ni predicción de hábitat."
  ],
  [
    "North Atlantic data map",
    "Datenkarte des Nordatlantiks",
    "Carte des données de l’Atlantique Nord",
    "Mapa de datos del Atlántico Norte"
  ],
  [
    "Basemap · Not a scientific data layer",
    "Grundkarte · Keine wissenschaftliche Datenebene",
    "Fond de carte · Pas une couche de données scientifiques",
    "Mapa base · No es una capa de datos científicos"
  ],
  [
    "Sources & coverage ↗",
    "Quellen & Abdeckung ↗",
    "Sources et couverture ↗",
    "Fuentes y cobertura ↗"
  ],
  [
    "W—A / SPECIES-SPECIFIC ARCHITECTURE",
    "W—A / ARTSPEZIFISCHE ARCHITEKTUR",
    "W—A / ARCHITECTURE PAR ESPÈCE",
    "W—A / ARQUITECTURA POR ESPECIE"
  ],
  [
    "Every species.",
    "Jede Art.",
    "Chaque espèce.",
    "Cada especie."
  ],
  [
    "Its own model.",
    "Ihr eigenes Modell.",
    "Son propre modèle.",
    "Su propio modelo."
  ],
  [
    "MODEL INFRASTRUCTURE",
    "MODELLINFRASTRUKTUR",
    "INFRASTRUCTURE DES MODÈLES",
    "INFRAESTRUCTURA DE MODELOS"
  ],
  [
    "One ocean. Different data requirements.",
    "Ein Ozean. Unterschiedliche Datenanforderungen.",
    "Un même océan. Des besoins en données différents.",
    "Un océano. Distintas necesidades de datos."
  ],
  [
    "Insufficient data for analysis. No scientific model has been connected yet.",
    "Unzureichende Daten für eine Analyse. Noch kein wissenschaftliches Modell angebunden.",
    "Données insuffisantes pour l’analyse. Aucun modèle scientifique n’est encore connecté.",
    "Datos insuficientes para el análisis. Aún no se ha conectado ningún modelo científico."
  ],
  [
    "Explore data dependencies ↗",
    "Datenabhängigkeiten ansehen ↗",
    "Voir les dépendances de données ↗",
    "Ver las dependencias de datos ↗"
  ],
  [
    "W—A / ROUTING ARCHITECTURE",
    "W—A / ROUTENARCHITEKTUR",
    "W—A / ARCHITECTURE DES ROUTES",
    "W—A / ARQUITECTURA DE RUTAS"
  ],
  [
    "With the right data.",
    "Mit den richtigen Daten.",
    "Avec les bonnes données.",
    "Con los datos adecuados."
  ],
  [
    "EXTENSIBLE INFRASTRUCTURE",
    "ERWEITERBARE INFRASTRUKTUR",
    "INFRASTRUCTURE EXTENSIBLE",
    "INFRAESTRUCTURA AMPLIABLE"
  ],
  [
    "New cost terms, with validated methods.",
    "Neue Kostenfaktoren mit validierten Methoden.",
    "De nouveaux critères de coût, avec des méthodes validées.",
    "Nuevos factores de coste, con métodos validados."
  ],
  [
    "EXISTING ENGINE",
    "BESTEHENDE ENGINE",
    "MOTEUR EXISTANT",
    "MOTOR EXISTENTE"
  ],
  [
    "Legacy route planner",
    "Bisheriger Routenplaner",
    "Planificateur classique",
    "Planificador clásico"
  ],
  [
    "Ordered waypoints, Haversine distance and existing chlorophyll thresholds are preserved.",
    "Geordnete Wegpunkte, Haversine-Distanz und bestehende Chlorophyll-Schwellen bleiben erhalten.",
    "Les points ordonnés, la distance de Haversine et les seuils de chlorophylle existants sont conservés.",
    "Se conservan los puntos ordenados, la distancia de Haversine y los umbrales de clorofila existentes."
  ],
  [
    "Open route planner ↗",
    "Routenplaner öffnen ↗",
    "Ouvrir le planificateur ↗",
    "Abrir el planificador ↗"
  ],
  [
    "Awaiting HYDRA source code.",
    "HYDRA-Quellcode ausstehend.",
    "Code source HYDRA attendu.",
    "Pendiente del código fuente de HYDRA."
  ],
  [
    "The 16-direction A* implementation was not found in this repository. The engine interface is ready; no replacement algorithm has been written.",
    "Die A*-Implementierung mit 16 Richtungen wurde in diesem Repository nicht gefunden. Die Engine-Schnittstelle ist bereit; kein Ersatzalgorithmus wurde geschrieben.",
    "L’implémentation A* à 16 directions est absente de ce dépôt. L’interface du moteur est prête ; aucun algorithme de remplacement n’a été écrit.",
    "No se encontró la implementación A* de 16 direcciones en este repositorio. La interfaz del motor está preparada; no se ha escrito un algoritmo sustituto."
  ],
  [
    "HYDRA 2.0 components",
    "HYDRA-2.0-Komponenten",
    "Composants HYDRA 2.0",
    "Componentes de HYDRA 2.0"
  ],
  [
    "Awaiting method and data",
    "Methode und Daten ausstehend",
    "Méthode et données attendues",
    "Pendiente de método y datos"
  ],
  [
    "No new risk, fuel or CO₂ results are produced.",
    "Keine neuen Risiko-, Kraftstoff- oder CO₂-Ergebnisse.",
    "Aucun nouveau résultat de risque, de carburant ou de CO₂ n’est produit.",
    "No se generan nuevos resultados de riesgo, combustible ni CO₂."
  ],
  [
    "Existing calculation method ↗",
    "Bestehende Berechnungsmethode ↗",
    "Méthode de calcul existante ↗",
    "Método de cálculo existente ↗"
  ],
  [
    "Close source details",
    "Quellendetails schließen",
    "Fermer les détails de la source",
    "Cerrar los detalles de la fuente"
  ],
  [
    "Legacy indicators are not validated species probabilities, vessel-specific fuel consumption or CO₂ calculations. The raw NASA product, years and exact coverage have not been supplied.",
    "Bisherige Indikatoren sind keine validierten Artenwahrscheinlichkeiten, schiffsspezifischen Verbrauchs- oder CO₂-Berechnungen. NASA-Rohprodukt, Jahre und genaue Abdeckung fehlen.",
    "Les indicateurs classiques ne sont pas des probabilités d’espèce validées ni des calculs de carburant ou de CO₂ propres à un navire. Le produit NASA brut, les années et la couverture exacte n’ont pas été fournis.",
    "Los indicadores clásicos no son probabilidades de especies validadas ni cálculos de combustible o CO₂ específicos de un buque. No se han proporcionado el producto original de NASA, los años ni la cobertura exacta."
  ],
  [
    "The chlorophyll-a ratio reaches the legacy model's moderate threshold. This classification is not an observed whale position or species-specific habitat prediction.",
    "Das Chlorophyll-a-Verhältnis erreicht die mittlere Schwelle des bisherigen Modells. Diese Klasse ist weder eine beobachtete Walposition noch eine artspezifische Habitatprognose.",
    "Le rapport de chlorophylle-a atteint le seuil modéré du modèle classique. Cette classe n’est ni une position de baleine observée ni une prédiction d’habitat propre à une espèce.",
    "La relación de clorofila-a alcanza el umbral moderado del modelo clásico. Esta clase no es una posición de ballena observada ni una predicción de hábitat específica de una especie."
  ],
  [
    "The chlorophyll-a ratio reaches the legacy model's critical threshold. This classification is not a validated collision probability.",
    "Das Chlorophyll-a-Verhältnis erreicht die kritische Schwelle des bisherigen Modells. Diese Klasse ist keine validierte Kollisionswahrscheinlichkeit.",
    "Le rapport de chlorophylle-a atteint le seuil critique du modèle classique. Cette classe n’est pas une probabilité de collision validée.",
    "La relación de clorofila-a alcanza el umbral crítico del modelo clásico. Esta clase no es una probabilidad de colisión validada."
  ],
  [
    "Start with two waypoints.",
    "Mit zwei Wegpunkten beginnen.",
    "Commencez par deux points de passage.",
    "Comienza con dos puntos de paso."
  ],
  [
    "Explore tools",
    "Werkzeuge entdecken",
    "Découvrir les outils",
    "Explorar las herramientas"
  ],
  [
    "Platform",
    "Plattform",
    "Plateforme",
    "Plataforma"
  ],
  [
    "Records",
    "Aufzeichnungen",
    "Enregistrements",
    "Registros"
  ],
  [
    "Data",
    "Daten",
    "Données",
    "Datos"
  ],
  [
    "A whale breaching in the ocean",
    "Ein Wal springt aus dem Ozean",
    "Une baleine bondissant hors de l’océan",
    "Una ballena saltando en el océano"
  ],
  [
    "Their ocean.",
    "Ihr Ozean.",
    "Leur océan.",
    "Su océano."
  ],
  [
    "Our course.",
    "Unser Kurs.",
    "Notre cap.",
    "Nuestro rumbo."
  ],
  [
    "Route intelligence. With whales in mind.",
    "Routenanalyse. Mit Blick auf Wale.",
    "Des routes pensées pour les baleines.",
    "Rutas que tienen en cuenta a las ballenas."
  ],
  [
    "Plan your voyage",
    "Route planen",
    "Planifier votre route",
    "Planificar tu ruta"
  ],
  [
    "Analyze risk",
    "Risiko analysieren",
    "Analyser le risque",
    "Analizar el riesgo"
  ],
  [
    "Explore the workspace",
    "Arbeitsbereich entdecken",
    "Découvrir l’espace de travail",
    "Explorar el área de trabajo"
  ],
  [
    "ANTARCTICA / SOUTHERN OCEAN",
    "ANTARKTIS / SÜDLICHER OZEAN",
    "ANTARCTIQUE / OCÉAN AUSTRAL",
    "ANTÁRTIDA / OCÉANO AUSTRAL"
  ],
  [
    "01 / WORKSPACE",
    "01 / ARBEITSBEREICH",
    "01 / ESPACE DE TRAVAIL",
    "01 / ÁREA DE TRABAJO"
  ],
  [
    "Read the ocean.",
    "Den Ozean lesen.",
    "Lire l’océan.",
    "Leer el océano."
  ],
  [
    "Saved voyages",
    "Gespeicherte Fahrten",
    "Traversées enregistrées",
    "Travesías guardadas"
  ],
  [
    "Awaiting analysis",
    "Analyse ausstehend",
    "Analyse en attente",
    "Análisis pendiente"
  ],
  [
    "Skip to content",
    "Zum Inhalt springen",
    "Aller au contenu",
    "Saltar al contenido"
  ],
  [
    "W-ALERTER home",
    "W-ALERTER-Startseite",
    "Accueil W-ALERTER",
    "Inicio de W-ALERTER"
  ],
  [
    "Main navigation",
    "Hauptnavigation",
    "Navigation principale",
    "Navegación principal"
  ],
  [
    "Overview",
    "Entdecken",
    "Découvrir",
    "Explorar"
  ],
  [
    "Workspace",
    "Arbeitsbereich",
    "Espace de travail",
    "Área de trabajo"
  ],
  [
    "Data & methodology",
    "Daten & Methodik",
    "Données et méthode",
    "Datos y metodología"
  ],
  [
    "Archive-based analysis",
    "Archivbasierte Analyse",
    "Analyse fondée sur les archives",
    "Análisis basado en archivos"
  ],
  [
    "Platform guide",
    "Plattformhilfe",
    "Guide de la plateforme",
    "Guía de la plataforma"
  ],
  [
    "Open platform",
    "Plattform öffnen",
    "Ouvrir la plateforme",
    "Abrir la plataforma"
  ],
  [
    "Open navigation",
    "Menü öffnen",
    "Ouvrir le menu",
    "Abrir el menú"
  ],
  [
    "Interface language",
    "Sprache der Oberfläche",
    "Langue de l’interface",
    "Idioma de la interfaz"
  ],
  [
    "Switch to Turkish",
    "Zu Türkisch wechseln",
    "Passer en turc",
    "Cambiar a turco"
  ],
  [
    "Switch to English",
    "Zu Englisch wechseln",
    "Passer en anglais",
    "Cambiar a inglés"
  ],
  [
    "Explore W-ALERTER",
    "W-ALERTER entdecken",
    "Découvrir W-ALERTER",
    "Explorar W-ALERTER"
  ],
  [
    "DECISION SUPPORT FOR MARINE ECOSYSTEMS",
    "ENTSCHEIDUNGSUNTERSTÜTZUNG FÜR MEERESÖKOSYSTEME",
    "AIDE À LA DÉCISION POUR LES ÉCOSYSTÈMES MARINS",
    "APOYO A LA DECISIÓN PARA ECOSISTEMAS MARINOS"
  ],
  [
    "Marine-aware",
    "Mit Blick auf das Meer",
    "Respectueuse du milieu marin",
    "Con atención al entorno marino"
  ],
  [
    "route intelligence.",
    "Routenanalyse.",
    "analyse des routes.",
    "análisis de rutas."
  ],
  [
    "Compare chlorophyll-a observations against seasonal references. Assess regional risk, plan voyages and manage your analyses in one workspace.",
    "Chlorophyll-a-Beobachtungen mit saisonalen Referenzen vergleichen. Regionale Risiken bewerten, Fahrten planen und Analysen in einem Arbeitsbereich verwalten.",
    "Comparez les observations de chlorophylle-a aux références saisonnières. Évaluez le risque régional, planifiez vos traversées et gérez vos analyses dans un même espace.",
    "Compara las observaciones de clorofila-a con referencias estacionales. Evalúa el riesgo regional, planifica travesías y gestiona los análisis en un mismo espacio."
  ],
  [
    "Open workspace",
    "Arbeitsbereich öffnen",
    "Ouvrir l’espace de travail",
    "Abrir el área de trabajo"
  ],
  [
    "Explore the methodology",
    "Methodik ansehen",
    "Consulter la méthode",
    "Consultar la metodología"
  ],
  [
    "Chlorophyll-a archive references",
    "Chlorophyll-a-Archivreferenzen",
    "Références archivées de chlorophylle-a",
    "Referencias archivadas de clorofila-a"
  ],
  [
    "Antarctica",
    "Antarktis",
    "Antarctique",
    "Antártida"
  ],
  [
    "ANTARCTICA",
    "ANTARKTIS",
    "ANTARCTIQUE",
    "ANTÁRTIDA"
  ],
  [
    "Southern Ocean study area",
    "Untersuchungsgebiet im Südlichen Ozean",
    "Zone d’étude de l’océan Austral",
    "Área de estudio del océano Austral"
  ],
  [
    "Map of the Antarctic study area",
    "Karte des antarktischen Untersuchungsgebiets",
    "Carte de la zone d’étude antarctique",
    "Mapa del área de estudio antártica"
  ],
  [
    "Ocean basemap",
    "Ozean-Grundkarte",
    "Fond de carte océanique",
    "Mapa base oceánico"
  ],
  [
    "STUDY AREA",
    "UNTERSUCHUNGSGEBIET",
    "ZONE D’ÉTUDE",
    "ÁREA DE ESTUDIO"
  ],
  [
    "Seasonal ocean reference data.",
    "Saisonale Ozeanreferenzen.",
    "Références océaniques saisonnières.",
    "Referencias oceánicas estacionales."
  ],
  [
    "Chlorophyll-a · Monthly archive references",
    "Chlorophyll-a · Monatliche Archivreferenzen",
    "Chlorophylle-a · Références mensuelles archivées",
    "Clorofila-a · Referencias mensuales archivadas"
  ],
  [
    "Open data and methodology",
    "Daten und Methodik öffnen",
    "Ouvrir les données et la méthode",
    "Abrir datos y metodología"
  ],
  [
    "INTEGRATED ANALYSIS TOOLS",
    "INTEGRIERTE ANALYSEWERKZEUGE",
    "OUTILS D’ANALYSE INTÉGRÉS",
    "HERRAMIENTAS DE ANÁLISIS INTEGRADAS"
  ],
  [
    "From observations to",
    "Von Beobachtungen zu",
    "Des observations aux",
    "De las observaciones a"
  ],
  [
    "measurable insights.",
    "messbaren Erkenntnissen.",
    "résultats mesurables.",
    "resultados medibles."
  ],
  [
    "Seasonal references, location analysis and voyage planning. A connected set of tools for marine-aware decisions.",
    "Saisonale Referenzen, Standortanalyse und Fahrtplanung. Verbundene Werkzeuge für Entscheidungen mit Blick auf das Meeresökosystem.",
    "Références saisonnières, analyse de position et planification des traversées. Des outils réunis pour des décisions attentives au milieu marin.",
    "Referencias estacionales, análisis de ubicación y planificación de travesías. Herramientas conectadas para decidir teniendo en cuenta el entorno marino."
  ],
  [
    "Regional risk analysis",
    "Regionale Risikoanalyse",
    "Analyse du risque régional",
    "Análisis del riesgo regional"
  ],
  [
    "Compare chlorophyll-a measurements against monthly references and review the regional risk class alongside the model indicator.",
    "Chlorophyll-a-Messwerte mit monatlichen Referenzen vergleichen und regionale Risikoklasse sowie Modellindikator prüfen.",
    "Comparez les mesures de chlorophylle-a aux références mensuelles et consultez la classe de risque régional et l’indicateur du modèle.",
    "Compara las mediciones de clorofila-a con las referencias mensuales y consulta la clase de riesgo regional y el indicador del modelo."
  ],
  [
    "Multi-point voyage planning",
    "Fahrtplanung mit mehreren Wegpunkten",
    "Planification à plusieurs points",
    "Planificación con varios puntos"
  ],
  [
    "Organize waypoints, review risk and distance for each leg, and calculate estimated fuel savings.",
    "Wegpunkte ordnen, Risiko und Distanz jeder Etappe prüfen und geschätzte Kraftstoffeinsparungen berechnen.",
    "Organisez les points de passage, examinez le risque et la distance de chaque étape et calculez les économies estimées de carburant.",
    "Ordena los puntos de paso, revisa el riesgo y la distancia de cada tramo y calcula el ahorro estimado de combustible."
  ],
  [
    "Records and reporting",
    "Aufzeichnungen und Berichte",
    "Enregistrements et rapports",
    "Registros e informes"
  ],
  [
    "Name and save voyages, revisit observations, and export route files and reports.",
    "Fahrten benennen und speichern, Beobachtungen erneut öffnen sowie Routendateien und Berichte exportieren.",
    "Nommez et enregistrez vos traversées, retrouvez vos observations et exportez les fichiers de route et les rapports.",
    "Asigna nombres y guarda las travesías, vuelve a consultar observaciones y exporta archivos de ruta e informes."
  ],
  [
    "FROM OBSERVATION TO VOYAGE REPORT",
    "VON DER BEOBACHTUNG ZUM FAHRTBERICHT",
    "DE L’OBSERVATION AU RAPPORT DE TRAVERSÉE",
    "DE LA OBSERVACIÓN AL INFORME DE TRAVESÍA"
  ],
  [
    "Assess your voyage with data.",
    "Die Fahrt mit Daten bewerten.",
    "Évaluez votre traversée avec des données.",
    "Evalúa tu travesía con datos."
  ],
  [
    "Create an observation",
    "Beobachtung erstellen",
    "Créer une observation",
    "Crear una observación"
  ],
  [
    "Designed for the ocean.",
    "Für den Ozean entwickelt.",
    "Conçu pour l’océan.",
    "Diseñado para el océano."
  ],
  [
    "Observe. Understand. Protect.",
    "Beobachten. Verstehen. Schützen.",
    "Observer. Comprendre. Protéger.",
    "Observar. Comprender. Proteger."
  ],
  [
    "Voyage workspace",
    "Fahrtarbeitsbereich",
    "Espace de traversée",
    "Área de trabajo de travesías"
  ],
  [
    "ANTARCTICA / VOYAGE WORKSPACE",
    "ANTARKTIS / FAHRTARBEITSBEREICH",
    "ANTARCTIQUE / ESPACE DE TRAVERSÉE",
    "ANTÁRTIDA / ÁREA DE TRAVESÍAS"
  ],
  [
    "Regional analysis",
    "Regionale Analyse",
    "Analyse régionale",
    "Análisis regional"
  ],
  [
    "Voyage planning",
    "Fahrtplanung",
    "Planification de traversée",
    "Planificación de travesías"
  ],
  [
    "Risk analysis",
    "Risikoanalyse",
    "Analyse du risque",
    "Análisis de riesgo"
  ],
  [
    "Workspace mode",
    "Arbeitsmodus",
    "Mode de travail",
    "Modo de trabajo"
  ],
  [
    "Location analysis",
    "Standortanalyse",
    "Analyse de position",
    "Análisis de ubicación"
  ],
  [
    "Voyage planner",
    "Routenplaner",
    "Planificateur de route",
    "Planificador de rutas"
  ],
  [
    "Draft ready",
    "Entwurf bereit",
    "Brouillon prêt",
    "Borrador listo"
  ],
  [
    "Import a route file",
    "Routendatei importieren",
    "Importer un fichier de route",
    "Importar un archivo de ruta"
  ],
  [
    "Import",
    "Importieren",
    "Importer",
    "Importar"
  ],
  [
    "Save voyage",
    "Fahrt speichern",
    "Enregistrer la traversée",
    "Guardar travesía"
  ],
  [
    "01 / OBSERVATION",
    "01 / BEOBACHTUNG",
    "01 / OBSERVATION",
    "01 / OBSERVACIÓN"
  ],
  [
    "Select a location and evaluate your measurement.",
    "Standort auswählen und Messwert bewerten.",
    "Sélectionnez une position et évaluez votre mesure.",
    "Selecciona una ubicación y evalúa tu medición."
  ],
  [
    "Observation period",
    "Beobachtungszeitraum",
    "Période d’observation",
    "Período de observación"
  ],
  [
    "October",
    "Oktober",
    "Octobre",
    "Octubre"
  ],
  [
    "November",
    "November",
    "Novembre",
    "Noviembre"
  ],
  [
    "December",
    "Dezember",
    "Décembre",
    "Diciembre"
  ],
  [
    "January",
    "Januar",
    "Janvier",
    "Enero"
  ],
  [
    "OCTOBER",
    "OKTOBER",
    "OCTOBRE",
    "OCTUBRE"
  ],
  [
    "NOVEMBER",
    "NOVEMBER",
    "NOVEMBRE",
    "NOVIEMBRE"
  ],
  [
    "DECEMBER",
    "DEZEMBER",
    "DÉCEMBRE",
    "DICIEMBRE"
  ],
  [
    "JANUARY",
    "JANUAR",
    "JANVIER",
    "ENERO"
  ],
  [
    "Monthly reference",
    "Monatliche Referenz",
    "Référence mensuelle",
    "Referencia mensual"
  ],
  [
    "Latitude",
    "Breitengrad",
    "Latitude",
    "Latitud"
  ],
  [
    "Longitude",
    "Längengrad",
    "Longitude",
    "Longitud"
  ],
  [
    "Chlorophyll-a measurement",
    "Chlorophyll-a-Messwert",
    "Mesure de chlorophylle-a",
    "Medición de clorofila-a"
  ],
  [
    "Enter a satellite or sensor measurement.",
    "Satelliten- oder Sensormesswert eingeben.",
    "Saisissez une mesure satellite ou de capteur.",
    "Introduce una medición de satélite o sensor."
  ],
  [
    "Analyze location",
    "Standort analysieren",
    "Analyser la position",
    "Analizar ubicación"
  ],
  [
    "Run an observation analysis to review regional risk and the model indicator here.",
    "Beobachtungsanalyse starten, um hier das regionale Risiko und den Modellindikator zu prüfen.",
    "Lancez une analyse d’observation pour consulter ici le risque régional et l’indicateur du modèle.",
    "Ejecuta un análisis de observación para consultar aquí el riesgo regional y el indicador del modelo."
  ],
  [
    "Fixed references. Your observations.",
    "Feste Referenzen. Ihre Beobachtungen.",
    "Références fixes. Vos observations.",
    "Referencias fijas. Tus observaciones."
  ],
  [
    "ANALYSIS RESULT",
    "ANALYSEERGEBNIS",
    "RÉSULTAT DE L’ANALYSE",
    "RESULTADO DEL ANÁLISIS"
  ],
  [
    "Whale passage indicator",
    "Indikator für Walpassagen",
    "Indicateur de passage de baleines",
    "Indicador de paso de ballenas"
  ],
  [
    "Model estimate",
    "Modellschätzung",
    "Estimation du modèle",
    "Estimación del modelo"
  ],
  [
    "Reference ratio",
    "Verhältnis zur Referenz",
    "Rapport à la référence",
    "Relación con la referencia"
  ],
  [
    "Observation",
    "Beobachtung",
    "Observation",
    "Observación"
  ],
  [
    "Archive reference",
    "Archivreferenz",
    "Référence archivée",
    "Referencia archivada"
  ],
  [
    "Add waypoint to voyage",
    "Wegpunkt zur Fahrt hinzufügen",
    "Ajouter un point à la route",
    "Añadir punto a la ruta"
  ],
  [
    "02 / VOYAGE PLAN",
    "02 / FAHRTPLAN",
    "02 / PLAN DE TRAVERSÉE",
    "02 / PLAN DE TRAVESÍA"
  ],
  [
    "Voyage plan",
    "Fahrtplan",
    "Plan de traversée",
    "Plan de travesía"
  ],
  [
    "Define waypoints and evaluate each voyage leg.",
    "Wegpunkte festlegen und jede Etappe bewerten.",
    "Définissez des points et évaluez chaque étape.",
    "Define puntos de paso y evalúa cada tramo."
  ],
  [
    "Voyage name",
    "Fahrtname",
    "Nom de la traversée",
    "Nombre de la travesía"
  ],
  [
    "Name your voyage",
    "Fahrt benennen",
    "Nommer votre traversée",
    "Asigna un nombre a la travesía"
  ],
  [
    "Voyage month",
    "Fahrtmonat",
    "Mois de la traversée",
    "Mes de la travesía"
  ],
  [
    "Add a waypoint",
    "Wegpunkt hinzufügen",
    "Ajouter un point de passage",
    "Añadir un punto de paso"
  ],
  [
    "Cancel",
    "Abbrechen",
    "Annuler",
    "Cancelar"
  ],
  [
    "Chlorophyll-a",
    "Chlorophyll-a",
    "Chlorophylle-a",
    "Clorofila-a"
  ],
  [
    "Measurement",
    "Messwert",
    "Mesure",
    "Medición"
  ],
  [
    "Add waypoint",
    "Wegpunkt hinzufügen",
    "Ajouter un point",
    "Añadir punto"
  ],
  [
    "Waypoints",
    "Wegpunkte",
    "Points de passage",
    "Puntos de paso"
  ],
  [
    "Clear",
    "Leeren",
    "Effacer",
    "Vaciar"
  ],
  [
    "Analyze voyage",
    "Fahrt analysieren",
    "Analyser la traversée",
    "Analizar travesía"
  ],
  [
    "Your draft is saved automatically in this browser.",
    "Der Entwurf wird automatisch in diesem Browser gespeichert.",
    "Votre brouillon est enregistré automatiquement dans ce navigateur.",
    "El borrador se guarda automáticamente en este navegador."
  ],
  [
    "Location analysis map",
    "Karte zur Standortanalyse",
    "Carte d’analyse de position",
    "Mapa de análisis de ubicación"
  ],
  [
    "Voyage planning map",
    "Karte zur Fahrtplanung",
    "Carte de planification de route",
    "Mapa de planificación de rutas"
  ],
  [
    "Map layer",
    "Kartenebene",
    "Couche de carte",
    "Capa del mapa"
  ],
  [
    "Ocean",
    "Ozean",
    "Océan",
    "Océano"
  ],
  [
    "Map",
    "Karte",
    "Carte",
    "Mapa"
  ],
  [
    "SOUTHERN OCEAN",
    "SÜDLICHER OZEAN",
    "OCÉAN AUSTRAL",
    "OCÉANO AUSTRAL"
  ],
  [
    "Center map",
    "Karte zentrieren",
    "Centrer la carte",
    "Centrar el mapa"
  ],
  [
    "Zoom in",
    "Vergrößern",
    "Zoom avant",
    "Acercar"
  ],
  [
    "Zoom out",
    "Verkleinern",
    "Zoom arrière",
    "Alejar"
  ],
  [
    "Click the map to select a location",
    "Standort durch Klicken auf die Karte auswählen",
    "Cliquez sur la carte pour choisir une position",
    "Haz clic en el mapa para elegir una ubicación"
  ],
  [
    "Select a location · Drag waypoints to reposition",
    "Standort auswählen · Wegpunkte zum Verschieben ziehen",
    "Choisir une position · Déplacer les points par glisser-déposer",
    "Elegir ubicación · Arrastrar puntos para moverlos"
  ],
  [
    "Normal",
    "Normal",
    "Normal",
    "Normal"
  ],
  [
    "Normal conditions",
    "Normale Bedingungen",
    "Conditions normales",
    "Condiciones normales"
  ],
  [
    "Moderate risk",
    "Mittleres Risiko",
    "Risque modéré",
    "Riesgo moderado"
  ],
  [
    "Critical risk",
    "Kritisches Risiko",
    "Risque critique",
    "Riesgo crítico"
  ],
  [
    "SELECTED OBSERVATION",
    "AUSGEWÄHLTE BEOBACHTUNG",
    "OBSERVATION SÉLECTIONNÉE",
    "OBSERVACIÓN SELECCIONADA"
  ],
  [
    "TOTAL DISTANCE",
    "GESAMTDISTANZ",
    "DISTANCE TOTALE",
    "DISTANCIA TOTAL"
  ],
  [
    "AT-RISK LEGS",
    "RISIKOETAPPEN",
    "ÉTAPES À RISQUE",
    "TRAMOS DE RIESGO"
  ],
  [
    "ESTIMATED FUEL SAVINGS",
    "GESCHÄTZTE KRAFTSTOFFEINSPARUNG",
    "ÉCONOMIES ESTIMÉES DE CARBURANT",
    "AHORRO ESTIMADO DE COMBUSTIBLE"
  ],
  [
    "TARGET SPEED PARAMETER",
    "ZIELGESCHWINDIGKEIT",
    "PARAMÈTRE DE VITESSE CIBLE",
    "PARÁMETRO DE VELOCIDAD OBJETIVO"
  ],
  [
    "28.5% speed reduction · 2.5 L/NM",
    "28.5% Geschwindigkeitsreduktion · 2.5 L/NM",
    "Réduction de vitesse de 28.5% · 2.5 L/NM",
    "Reducción de velocidad del 28.5% · 2.5 L/NM"
  ],
  [
    "LEG-BY-LEG ASSESSMENT",
    "BEWERTUNG JE ETAPPE",
    "ÉVALUATION PAR ÉTAPE",
    "EVALUACIÓN POR TRAMO"
  ],
  [
    "Voyage leg assessment",
    "Etappenbewertung",
    "Évaluation des étapes",
    "Evaluación de tramos"
  ],
  [
    "Download report",
    "Bericht herunterladen",
    "Télécharger le rapport",
    "Descargar informe"
  ],
  [
    "Leg",
    "Etappe",
    "Étape",
    "Tramo"
  ],
  [
    "Arrival coordinates",
    "Ankunftskoordinaten",
    "Coordonnées d’arrivée",
    "Coordenadas de llegada"
  ],
  [
    "Distance",
    "Distanz",
    "Distance",
    "Distancia"
  ],
  [
    "Assessment",
    "Bewertung",
    "Évaluation",
    "Evaluación"
  ],
  [
    "Each leg is classified using its arrival waypoint. The route connects your waypoints in order.",
    "Jede Etappe wird anhand ihres Ankunftswegpunkts eingestuft. Die Route verbindet die Wegpunkte in ihrer Reihenfolge.",
    "Chaque étape est classée selon son point d’arrivée. La route relie vos points dans l’ordre.",
    "Cada tramo se clasifica según su punto de llegada. La ruta conecta los puntos en su orden."
  ],
  [
    "RECENT ACTIVITY",
    "LETZTE AKTIVITÄTEN",
    "ACTIVITÉ RÉCENTE",
    "ACTIVIDAD RECIENTE"
  ],
  [
    "Recent observations",
    "Letzte Beobachtungen",
    "Observations récentes",
    "Observaciones recientes"
  ],
  [
    "All records",
    "Alle Aufzeichnungen",
    "Tous les enregistrements",
    "Todos los registros"
  ],
  [
    "Archive references",
    "Archivreferenzen",
    "Références archivées",
    "Referencias archivadas"
  ],
  [
    "Data & calculation method",
    "Daten & Berechnungsmethode",
    "Données et méthode de calcul",
    "Datos y método de cálculo"
  ],
  [
    "YOUR WORKSPACE",
    "IHR ARBEITSBEREICH",
    "VOTRE ESPACE DE TRAVAIL",
    "TU ÁREA DE TRABAJO"
  ],
  [
    "and observation history.",
    "und Beobachtungsverlauf.",
    "et historique des observations.",
    "e historial de observaciones."
  ],
  [
    "Create a voyage",
    "Fahrt erstellen",
    "Créer une traversée",
    "Crear una travesía"
  ],
  [
    "Your records are stored in this browser.",
    "Ihre Aufzeichnungen werden in diesem Browser gespeichert.",
    "Vos enregistrements sont stockés dans ce navigateur.",
    "Los registros se almacenan en este navegador."
  ],
  [
    "Back up your voyages as JSON and import them into another browser.",
    "Fahrten als JSON sichern und in einem anderen Browser importieren.",
    "Sauvegardez vos traversées en JSON et importez-les dans un autre navigateur.",
    "Guarda las travesías en JSON e impórtalas en otro navegador."
  ],
  [
    "Observation history",
    "Beobachtungsverlauf",
    "Historique des observations",
    "Historial de observaciones"
  ],
  [
    "Search records",
    "Aufzeichnungen durchsuchen",
    "Rechercher un enregistrement",
    "Buscar en los registros"
  ],
  [
    "Search records...",
    "Aufzeichnungen durchsuchen...",
    "Rechercher un enregistrement...",
    "Buscar en los registros..."
  ],
  [
    "Download CSV",
    "CSV herunterladen",
    "Télécharger le CSV",
    "Descargar CSV"
  ],
  [
    "Create a new observation",
    "Neue Beobachtung erstellen",
    "Créer une nouvelle observation",
    "Crear una nueva observación"
  ],
  [
    "TRANSPARENT DATA. CLEAR METHODOLOGY.",
    "TRANSPARENTE DATEN. KLARE METHODIK.",
    "DONNÉES TRANSPARENTES. MÉTHODE CLAIRE.",
    "DATOS TRANSPARENTES. METODOLOGÍA CLARA."
  ],
  [
    "Data sources",
    "Datenquellen",
    "Sources de données",
    "Fuentes de datos"
  ],
  [
    "and calculation methodology.",
    "und Berechnungsmethode.",
    "et méthode de calcul.",
    "y método de cálculo."
  ],
  [
    "Compare a measurement",
    "Messwert vergleichen",
    "Comparer une mesure",
    "Comparar una medición"
  ],
  [
    "Four monthly chlorophyll-a references from the W-ALERTER archive form the baseline for comparing observations.",
    "Vier monatliche Chlorophyll-a-Referenzen aus dem W-ALERTER-Archiv bilden die Vergleichsbasis für Beobachtungen.",
    "Quatre références mensuelles de chlorophylle-a des archives W-ALERTER servent de base de comparaison aux observations.",
    "Cuatro referencias mensuales de clorofila-a del archivo W-ALERTER constituyen la base para comparar observaciones."
  ],
  [
    "years of archive reference",
    "Jahre Archivreferenz",
    "années de référence archivée",
    "años de referencia archivada"
  ],
  [
    "Monthly references",
    "Monatliche Referenzen",
    "Références mensuelles",
    "Referencias mensuales"
  ],
  [
    "CHLOROPHYLL-a / mg/m³",
    "CHLOROPHYLL-a / mg/m³",
    "CHLOROPHYLLE-a / mg/m³",
    "CLOROFILA-a / mg/m³"
  ],
  [
    "Archive references are kept separate from observation measurements.",
    "Archivreferenzen werden getrennt von Beobachtungsmessungen gespeichert.",
    "Les références archivées restent séparées des mesures d’observation.",
    "Las referencias archivadas se mantienen separadas de las mediciones de observación."
  ],
  [
    "01 / LOCATION MODEL",
    "01 / STANDORTMODELL",
    "01 / MODÈLE DE POSITION",
    "01 / MODELO DE UBICACIÓN"
  ],
  [
    "Measurement in context.",
    "Messwerte im Kontext.",
    "Une mesure en contexte.",
    "La medición en contexto."
  ],
  [
    "The observed chlorophyll-a value is divided by the selected month's reference. This ratio determines the risk class in the existing W-ALERTER model.",
    "Der beobachtete Chlorophyll-a-Wert wird durch die Referenz des gewählten Monats geteilt. Das Verhältnis bestimmt die Risikoklasse des bestehenden W-ALERTER-Modells.",
    "La valeur observée de chlorophylle-a est divisée par la référence du mois choisi. Ce rapport détermine la classe de risque du modèle W-ALERTER existant.",
    "El valor observado de clorofila-a se divide entre la referencia del mes elegido. Esta relación determina la clase de riesgo del modelo W-ALERTER existente."
  ],
  [
    "Ratio = observation / monthly reference",
    "Verhältnis = Beobachtung / monatliche Referenz",
    "Rapport = observation / référence mensuelle",
    "Relación = observación / referencia mensual"
  ],
  [
    "ratio < 1.25",
    "Verhältnis < 1.25",
    "rapport < 1.25",
    "relación < 1.25"
  ],
  [
    "1.25 ≤ ratio < 1.8",
    "1.25 ≤ Verhältnis < 1.8",
    "1.25 ≤ rapport < 1.8",
    "1.25 ≤ relación < 1.8"
  ],
  [
    "ratio ≥ 1.8",
    "Verhältnis ≥ 1.8",
    "rapport ≥ 1.8",
    "relación ≥ 1.8"
  ],
  [
    "The passage indicator uses ratio × 50, capped at 99.8%. For ratios below 0.5, ratio × 18 is used. This indicator is a model estimate.",
    "Der Passageindikator nutzt Verhältnis × 50, begrenzt auf 99.8%. Unter 0.5 wird Verhältnis × 18 genutzt. Dieser Indikator ist eine Modellschätzung.",
    "L’indicateur de passage utilise rapport × 50, plafonné à 99.8%. Sous 0.5, il utilise rapport × 18. Cet indicateur est une estimation du modèle.",
    "El indicador de paso usa relación × 50, con un límite de 99.8%. Por debajo de 0.5 se usa relación × 18. Este indicador es una estimación del modelo."
  ],
  [
    "02 / VOYAGE MODEL",
    "02 / FAHRTMODELL",
    "02 / MODÈLE DE TRAVERSÉE",
    "02 / MODELO DE TRAVESÍA"
  ],
  [
    "A consistent assessment for every leg.",
    "Einheitliche Bewertung jeder Etappe.",
    "Une évaluation cohérente pour chaque étape.",
    "Una evaluación coherente de cada tramo."
  ],
  [
    "Waypoint distance is calculated with the Haversine formula using R = 3440 NM. If the arrival waypoint ratio is 1.25 or greater, the full leg is included in the at-risk distance.",
    "Wegpunktdistanzen werden mit der Haversine-Formel bei R = 3440 NM berechnet. Ist das Verhältnis am Ankunftspunkt ≥ 1.25, zählt die gesamte Etappe zur Risikodistanz.",
    "La distance entre points est calculée par Haversine avec R = 3440 NM. Si le rapport au point d’arrivée atteint 1.25, toute l’étape est incluse dans la distance à risque.",
    "La distancia entre puntos se calcula con Haversine y R = 3440 NM. Si la relación del punto de llegada es 1.25 o mayor, todo el tramo se incluye en la distancia de riesgo."
  ],
  [
    "At-risk distance × 2.5",
    "Risikodistanz × 2.5",
    "Distance à risque × 2.5",
    "Distancia de riesgo × 2.5"
  ],
  [
    "Model voyage parameters: target speed of 10 knots and a 28.5% speed reduction.",
    "Fahrtparameter des Modells: 10 Knoten Zielgeschwindigkeit und 28.5% Geschwindigkeitsreduktion.",
    "Paramètres du modèle : vitesse cible de 10 nœuds et réduction de vitesse de 28.5%.",
    "Parámetros del modelo: velocidad objetivo de 10 nudos y reducción de velocidad del 28.5%."
  ],
  [
    "Close save dialog",
    "Speicherfenster schließen",
    "Fermer la fenêtre d’enregistrement",
    "Cerrar la ventana de guardado"
  ],
  [
    "SAVE YOUR WORK",
    "ARBEIT SPEICHERN",
    "ENREGISTRER VOTRE TRAVAIL",
    "GUARDAR EL TRABAJO"
  ],
  [
    "Save this voyage and continue from the same point later.",
    "Diese Fahrt speichern und später an derselben Stelle fortsetzen.",
    "Enregistrez cette traversée pour la reprendre plus tard.",
    "Guarda esta travesía y continúa más adelante desde el mismo punto."
  ],
  [
    "e.g. Antarctic observation voyage",
    "z. B. antarktische Beobachtungsfahrt",
    "p. ex. traversée d’observation antarctique",
    "p. ej., travesía de observación antártica"
  ],
  [
    "This record is stored in your browser.",
    "Dieser Datensatz wird in Ihrem Browser gespeichert.",
    "Cet enregistrement est stocké dans votre navigateur.",
    "Este registro se almacena en tu navegador."
  ],
  [
    "Close guide",
    "Hilfe schließen",
    "Fermer le guide",
    "Cerrar la guía"
  ],
  [
    "PLATFORM GUIDE",
    "PLATTFORMHILFE",
    "GUIDE DE LA PLATEFORME",
    "GUÍA DE LA PLATAFORMA"
  ],
  [
    "Start using",
    "Die Plattform",
    "Commencez à utiliser",
    "Empieza a usar"
  ],
  [
    "the platform.",
    "kennenlernen.",
    "la plateforme.",
    "la plataforma."
  ],
  [
    "Select a location.",
    "Standort auswählen.",
    "Choisissez une position.",
    "Selecciona una ubicación."
  ],
  [
    "Click the map or enter coordinates.",
    "Auf die Karte klicken oder Koordinaten eingeben.",
    "Cliquez sur la carte ou saisissez les coordonnées.",
    "Haz clic en el mapa o introduce las coordenadas."
  ],
  [
    "Compare your measurement.",
    "Messwert vergleichen.",
    "Comparez votre mesure.",
    "Compara tu medición."
  ],
  [
    "Select a month, enter chlorophyll-a and run the analysis.",
    "Monat wählen, Chlorophyll-a eingeben und Analyse starten.",
    "Choisissez le mois, saisissez la chlorophylle-a et lancez l’analyse.",
    "Elige un mes, introduce la clorofila-a e inicia el análisis."
  ],
  [
    "Plan your voyage.",
    "Route planen.",
    "Planifiez votre route.",
    "Planifica tu ruta."
  ],
  [
    "Add at least two waypoints. Edit, reorder or drag them on the map.",
    "Mindestens zwei Wegpunkte hinzufügen. Punkte auf der Karte bearbeiten, umordnen oder ziehen.",
    "Ajoutez au moins deux points. Modifiez leur ordre ou déplacez-les sur la carte.",
    "Añade al menos dos puntos. Edítalos, cambia su orden o arrástralos en el mapa."
  ],
  [
    "Export your work.",
    "Arbeit exportieren.",
    "Exportez votre travail.",
    "Exporta tu trabajo."
  ],
  [
    "Save your voyage or export JSON, GPX and a report.",
    "Fahrt speichern oder JSON, GPX und Bericht exportieren.",
    "Enregistrez la traversée ou exportez JSON, GPX et rapport.",
    "Guarda la travesía o exporta JSON, GPX y un informe."
  ],
  [
    "Undo",
    "Rückgängig",
    "Annuler l’action",
    "Deshacer"
  ],
  [
    "Saved in this browser",
    "In diesem Browser gespeichert",
    "Enregistré dans ce navigateur",
    "Guardado en este navegador"
  ],
  [
    "Unable to save",
    "Speichern nicht möglich",
    "Enregistrement impossible",
    "No se puede guardar"
  ],
  [
    "This browser cannot save the draft. Back up your voyage as JSON.",
    "Dieser Browser kann den Entwurf nicht speichern. Die Fahrt als JSON sichern.",
    "Ce navigateur ne peut pas enregistrer le brouillon. Sauvegardez la traversée en JSON.",
    "Este navegador no puede guardar el borrador. Guarda una copia de la travesía en JSON."
  ],
  [
    "Your latest draft is stored in this browser.",
    "Der letzte Entwurf ist in diesem Browser gespeichert.",
    "Votre dernier brouillon est stocké dans ce navigateur.",
    "El último borrador se almacena en este navegador."
  ],
  [
    "Browser storage is unavailable. Export your voyage as JSON.",
    "Browserspeicher nicht verfügbar. Die Fahrt als JSON exportieren.",
    "Stockage du navigateur indisponible. Exportez la traversée en JSON.",
    "El almacenamiento del navegador no está disponible. Exporta la travesía en JSON."
  ],
  [
    "Marine risk intelligence",
    "Meeresrisikoanalyse",
    "Analyse des risques marins",
    "Análisis de riesgos marinos"
  ],
  [
    "Marine-aware route intelligence",
    "Meeresbewusste Routenanalyse",
    "Analyse des routes attentive au milieu marin",
    "Análisis de rutas con atención al entorno marino"
  ],
  [
    "The map layer is unavailable. Try the other layer or continue by entering coordinates.",
    "Kartenebene nicht verfügbar. Andere Ebene versuchen oder Koordinaten eingeben.",
    "Couche cartographique indisponible. Essayez l’autre couche ou saisissez les coordonnées.",
    "La capa del mapa no está disponible. Prueba la otra capa o introduce las coordenadas."
  ],
  [
    "The map could not load. Continue by entering coordinates.",
    "Karte konnte nicht geladen werden. Mit Koordinateneingabe fortfahren.",
    "La carte n’a pas pu être chargée. Continuez en saisissant les coordonnées.",
    "No se pudo cargar el mapa. Continúa introduciendo las coordenadas."
  ],
  [
    "Location selected. Enter a chlorophyll-a measurement to add the waypoint.",
    "Standort ausgewählt. Chlorophyll-a-Messwert eingeben, um den Wegpunkt hinzuzufügen.",
    "Position choisie. Saisissez une mesure de chlorophylle-a pour ajouter le point.",
    "Ubicación elegida. Introduce una medición de clorofila-a para añadir el punto."
  ],
  [
    "Observation calculated; this browser cannot save the history.",
    "Beobachtung berechnet; dieser Browser kann den Verlauf nicht speichern.",
    "Observation calculée ; ce navigateur ne peut pas enregistrer l’historique.",
    "Observación calculada; este navegador no puede guardar el historial."
  ],
  [
    "The chlorophyll-a ratio is below the risk thresholds. Continue regional monitoring and standard voyage assessment.",
    "Das Chlorophyll-a-Verhältnis liegt unter den Risikoschwellen. Regionale Überwachung und reguläre Fahrtbewertung fortsetzen.",
    "Le rapport de chlorophylle-a est inférieur aux seuils de risque. Poursuivez le suivi régional et l’évaluation habituelle de la traversée.",
    "La relación de clorofila-a está por debajo de los umbrales de riesgo. Continúa el seguimiento regional y la evaluación habitual de la travesía."
  ],
  [
    "Chlorophyll-a is above the baseline. An active feeding zone may be present. Alert lookouts and assess the voyage.",
    "Chlorophyll-a liegt über der Referenz. Eine aktive Nahrungszone könnte vorliegen. Ausguck informieren und Fahrt bewerten.",
    "La chlorophylle-a dépasse la référence. Une zone d’alimentation active peut être présente. Prévenez les vigies et évaluez la traversée.",
    "La clorofila-a supera la referencia. Puede haber una zona activa de alimentación. Avisa a los vigías y evalúa la travesía."
  ],
  [
    "Chlorophyll-a is substantially above the baseline. Assess the region within your voyage and review the passage carefully.",
    "Chlorophyll-a liegt deutlich über der Referenz. Die Region im Fahrtkontext bewerten und die Passage sorgfältig prüfen.",
    "La chlorophylle-a dépasse nettement la référence. Évaluez la région dans le contexte de la route et examinez le passage avec attention.",
    "La clorofila-a supera claramente la referencia. Evalúa la región dentro de la ruta y revisa el paso con atención."
  ],
  [
    "A voyage can contain up to 1,000 waypoints.",
    "Eine Fahrt kann bis zu 1,000 Wegpunkte enthalten.",
    "Une traversée peut contenir jusqu’à 1,000 points de passage.",
    "Una travesía puede contener hasta 1,000 puntos de paso."
  ],
  [
    "Apply changes",
    "Änderungen übernehmen",
    "Appliquer les modifications",
    "Aplicar cambios"
  ],
  [
    "Waypoint removed.",
    "Wegpunkt entfernt.",
    "Point supprimé.",
    "Punto eliminado."
  ],
  [
    "At risk",
    "Risikobehaftet",
    "À risque",
    "Con riesgo"
  ],
  [
    "Normal waypoint",
    "Normaler Wegpunkt",
    "Point normal",
    "Punto normal"
  ],
  [
    "At-risk waypoint",
    "Risikowegpunkt",
    "Point à risque",
    "Punto de riesgo"
  ],
  [
    "Select a location within the valid coordinate range.",
    "Standort im gültigen Koordinatenbereich wählen.",
    "Choisissez une position dans la plage de coordonnées valide.",
    "Elige una ubicación dentro del rango válido de coordenadas."
  ],
  [
    "At-risk leg",
    "Risikoetappe",
    "Étape à risque",
    "Tramo de riesgo"
  ],
  [
    "Normal leg",
    "Normale Etappe",
    "Étape normale",
    "Tramo normal"
  ],
  [
    "Voyage analyzed. Review the leg assessment below the map.",
    "Fahrt analysiert. Etappenbewertung unter der Karte prüfen.",
    "Traversée analysée. Consultez l’évaluation des étapes sous la carte.",
    "Travesía analizada. Consulta la evaluación de tramos bajo el mapa."
  ],
  [
    "Open observation",
    "Beobachtung öffnen",
    "Ouvrir l’observation",
    "Abrir observación"
  ],
  [
    "Your first analysis will create the observation history.",
    "Die erste Analyse erstellt den Beobachtungsverlauf.",
    "Votre première analyse créera l’historique des observations.",
    "El primer análisis creará el historial de observaciones."
  ],
  [
    "Your data is stored in this browser.",
    "Ihre Daten werden in diesem Browser gespeichert.",
    "Vos données sont stockées dans ce navigateur.",
    "Tus datos se almacenan en este navegador."
  ],
  [
    "Saved route overview",
    "Gespeicherte Routenübersicht",
    "Aperçu de la route enregistrée",
    "Vista de la ruta guardada"
  ],
  [
    "Last saved",
    "Zuletzt gespeichert",
    "Dernier enregistrement",
    "Último guardado"
  ],
  [
    "WAYPOINTS",
    "WEGPUNKTE",
    "POINTS DE PASSAGE",
    "PUNTOS DE PASO"
  ],
  [
    "DISTANCE",
    "DISTANZ",
    "DISTANCE",
    "DISTANCIA"
  ],
  [
    "AT-RISK DISTANCE",
    "RISIKODISTANZ",
    "DISTANCE À RISQUE",
    "DISTANCIA DE RIESGO"
  ],
  [
    "Open voyage",
    "Fahrt öffnen",
    "Ouvrir la traversée",
    "Abrir travesía"
  ],
  [
    "No matching voyages found.",
    "Keine passenden Fahrten gefunden.",
    "Aucune traversée correspondante.",
    "No se encontraron travesías coincidentes."
  ],
  [
    "Your next voyage starts here.",
    "Hier beginnt die nächste Fahrt.",
    "Votre prochaine traversée commence ici.",
    "Tu próxima travesía comienza aquí."
  ],
  [
    "Try another voyage name or month.",
    "Anderen Fahrtnamen oder Monat versuchen.",
    "Essayez un autre nom ou un autre mois.",
    "Prueba otro nombre de travesía o mes."
  ],
  [
    "Create, name and save your first voyage. Continue where you left off on your next visit.",
    "Erste Fahrt erstellen, benennen und speichern. Beim nächsten Besuch an derselben Stelle fortsetzen.",
    "Créez, nommez et enregistrez votre première traversée. Reprenez-la lors de votre prochaine visite.",
    "Crea, nombra y guarda tu primera travesía. Continúa donde lo dejaste en tu próxima visita."
  ],
  [
    "Create voyage",
    "Fahrt erstellen",
    "Créer une traversée",
    "Crear travesía"
  ],
  [
    "Date",
    "Datum",
    "Date",
    "Fecha"
  ],
  [
    "Location",
    "Standort",
    "Position",
    "Ubicación"
  ],
  [
    "Month",
    "Monat",
    "Mois",
    "Mes"
  ],
  [
    "Risk class",
    "Risikoklasse",
    "Classe de risque",
    "Clase de riesgo"
  ],
  [
    "Action",
    "Aktion",
    "Action",
    "Acción"
  ],
  [
    "Open",
    "Öffnen",
    "Ouvrir",
    "Abrir"
  ],
  [
    "No matching observations.",
    "Keine passenden Beobachtungen.",
    "Aucune observation correspondante.",
    "No hay observaciones coincidentes."
  ],
  [
    "Create your first observation.",
    "Erste Beobachtung erstellen.",
    "Créez votre première observation.",
    "Crea tu primera observación."
  ],
  [
    "Try a different search term.",
    "Anderen Suchbegriff versuchen.",
    "Essayez un autre terme de recherche.",
    "Prueba otro término de búsqueda."
  ],
  [
    "Your location analyses are stored here. Reopen any observation to review its results.",
    "Standortanalysen werden hier gespeichert. Jede Beobachtung kann erneut zur Prüfung geöffnet werden.",
    "Vos analyses de position sont conservées ici. Rouvrez une observation pour consulter ses résultats.",
    "Los análisis de ubicación se guardan aquí. Vuelve a abrir cualquier observación para consultar sus resultados."
  ],
  [
    "Voyage saved. Reopen it from Records.",
    "Fahrt gespeichert. Unter Aufzeichnungen erneut öffnen.",
    "Traversée enregistrée. Retrouvez-la dans les enregistrements.",
    "Travesía guardada. Ábrela de nuevo desde Registros."
  ],
  [
    "Voyage exported as JSON. You can import this file again.",
    "Fahrt als JSON exportiert. Diese Datei kann erneut importiert werden.",
    "Traversée exportée en JSON. Ce fichier peut être réimporté.",
    "Travesía exportada en JSON. Puedes volver a importar este archivo."
  ],
  [
    "Waypoints exported as GPX.",
    "Wegpunkte als GPX exportiert.",
    "Points exportés en GPX.",
    "Puntos exportados en GPX."
  ],
  [
    "No observations are available for export yet.",
    "Noch keine Beobachtungen zum Export verfügbar.",
    "Aucune observation à exporter pour le moment.",
    "Aún no hay observaciones para exportar."
  ],
  [
    "Observation history exported as CSV.",
    "Beobachtungsverlauf als CSV exportiert.",
    "Historique des observations exporté en CSV.",
    "Historial de observaciones exportado en CSV."
  ],
  [
    "This file is too large. Select a route file up to 2 MB.",
    "Datei zu groß. Eine Routendatei mit höchstens 2 MB auswählen.",
    "Fichier trop volumineux. Choisissez un fichier de route de 2 Mo maximum.",
    "El archivo es demasiado grande. Elige un archivo de ruta de hasta 2 MB."
  ],
  [
    "Voyage imported. Give it a name to save it.",
    "Fahrt importiert. Zum Speichern einen Namen vergeben.",
    "Traversée importée. Donnez-lui un nom pour l’enregistrer.",
    "Travesía importada. Asígnale un nombre para guardarla."
  ],
  [
    "Observation added as a voyage waypoint.",
    "Beobachtung als Wegpunkt zur Fahrt hinzugefügt.",
    "Observation ajoutée comme point de passage.",
    "Observación añadida como punto de paso de la travesía."
  ],
  [
    "A new voyage draft is ready.",
    "Neuer Fahrtentwurf bereit.",
    "Un nouveau brouillon de traversée est prêt.",
    "Un nuevo borrador de travesía está listo."
  ],
  [
    "Saved voyage removed.",
    "Gespeicherte Fahrt entfernt.",
    "Traversée enregistrée supprimée.",
    "Travesía guardada eliminada."
  ],
  [
    "Could not remove the voyage. Check browser storage.",
    "Fahrt konnte nicht entfernt werden. Browserspeicher prüfen.",
    "Impossible de supprimer la traversée. Vérifiez le stockage du navigateur.",
    "No se pudo eliminar la travesía. Comprueba el almacenamiento del navegador."
  ],
  [
    "The draft waypoints have been cleared.",
    "Wegpunkte des Entwurfs geleert.",
    "Les points du brouillon ont été effacés.",
    "Se han vaciado los puntos del borrador."
  ],
  [
    "Check the waypoints. Latitude, longitude and chlorophyll-a must be numeric.",
    "Wegpunkte prüfen. Breitengrad, Längengrad und Chlorophyll-a müssen numerisch sein.",
    "Vérifiez les points. Latitude, longitude et chlorophylle-a doivent être numériques.",
    "Revisa los puntos. La latitud, la longitud y la clorofila-a deben ser numéricas."
  ],
  [
    "The file does not contain a valid voyage month.",
    "Die Datei enthält keinen gültigen Fahrtmonat.",
    "Le fichier ne contient pas de mois de traversée valide.",
    "El archivo no contiene un mes de travesía válido."
  ],
  [
    "This browser cannot save records. Export the voyage as JSON instead.",
    "Dieser Browser kann keine Aufzeichnungen speichern. Die Fahrt stattdessen als JSON exportieren.",
    "Ce navigateur ne peut pas enregistrer les données. Exportez plutôt la traversée en JSON.",
    "Este navegador no puede guardar registros. Exporta la travesía en JSON."
  ],
  [
    "The file could not be read. Select a W-ALERTER JSON file.",
    "Datei konnte nicht gelesen werden. Eine W-ALERTER-JSON-Datei auswählen.",
    "Le fichier n’a pas pu être lu. Choisissez un fichier JSON W-ALERTER.",
    "No se pudo leer el archivo. Elige un archivo JSON de W-ALERTER."
  ],
  [
    "This file is not in the W-ALERTER route format.",
    "Diese Datei entspricht nicht dem W-ALERTER-Routenformat.",
    "Ce fichier n’est pas au format de route W-ALERTER.",
    "Este archivo no tiene el formato de ruta de W-ALERTER."
  ],
  [
    "Voyage report exported. Open it to print or save as PDF.",
    "Fahrtbericht exportiert. Zum Drucken oder als PDF speichern öffnen.",
    "Rapport exporté. Ouvrez-le pour l’imprimer ou l’enregistrer en PDF.",
    "Informe exportado. Ábrelo para imprimirlo o guardarlo como PDF."
  ],
  [
    "VOYAGE ANALYSIS REPORT",
    "FAHRTANALYSEBERICHT",
    "RAPPORT D’ANALYSE DE TRAVERSÉE",
    "INFORME DE ANÁLISIS DE TRAVESÍA"
  ],
  [
    "W-ALERTER Voyage Report",
    "W-ALERTER-Fahrtbericht",
    "Rapport de traversée W-ALERTER",
    "Informe de travesía W-ALERTER"
  ],
  [
    "Print / Save as PDF",
    "Drucken / Als PDF speichern",
    "Imprimer / Enregistrer en PDF",
    "Imprimir / Guardar como PDF"
  ],
  [
    "Waypoints and voyage legs",
    "Wegpunkte und Etappen",
    "Points de passage et étapes",
    "Puntos de paso y tramos"
  ],
  [
    "Waypoint",
    "Wegpunkt",
    "Point de passage",
    "Punto de paso"
  ],
  [
    "Chlorophyll-a (mg/m³)",
    "Chlorophyll-a (mg/m³)",
    "Chlorophylle-a (mg/m³)",
    "Clorofila-a (mg/m³)"
  ],
  [
    "Chlorophyll-a (mg/m3)",
    "Chlorophyll-a (mg/m3)",
    "Chlorophylle-a (mg/m3)",
    "Clorofila-a (mg/m3)"
  ],
  [
    "Previous leg (NM)",
    "Vorherige Etappe (NM)",
    "Étape précédente (NM)",
    "Tramo anterior (NM)"
  ],
  [
    "Waypoint risk",
    "Wegpunktrisiko",
    "Risque au point",
    "Riesgo del punto"
  ],
  [
    "Data and methodology",
    "Daten und Methodik",
    "Données et méthode",
    "Datos y metodología"
  ],
  [
    "chlorophyll-a reference:",
    "Chlorophyll-a-Referenz:",
    "référence de chlorophylle-a :",
    "referencia de clorofila-a:"
  ],
  [
    "W-ALERTER reference archive.",
    "W-ALERTER-Referenzarchiv.",
    "Archives de référence W-ALERTER.",
    "Archivo de referencias W-ALERTER."
  ],
  [
    "A waypoint is considered at risk when its ratio is 1.25 or higher. Leg risk is based on its arrival waypoint.",
    "Ein Wegpunkt gilt ab einem Verhältnis von 1.25 als risikobehaftet. Das Etappenrisiko richtet sich nach dem Ankunftspunkt.",
    "Un point est classé à risque à partir d’un rapport de 1.25. Le risque de l’étape dépend du point d’arrivée.",
    "Un punto se considera de riesgo con una relación de 1.25 o superior. El riesgo del tramo depende de su punto de llegada."
  ],
  [
    "Distance: Haversine, R = 3440 NM. Estimated fuel savings: at-risk distance × 2.5 L/NM. Model target speed: 10 knots; speed reduction: 28.5%. The route connects entered waypoints in order.",
    "Distanz: Haversine, R = 3440 NM. Geschätzte Kraftstoffeinsparung: Risikodistanz × 2.5 L/NM. Zielgeschwindigkeit des Modells: 10 Knoten; Reduktion: 28.5%. Die Route verbindet die eingegebenen Wegpunkte in ihrer Reihenfolge.",
    "Distance : Haversine, R = 3440 NM. Économies estimées de carburant : distance à risque × 2.5 L/NM. Vitesse cible : 10 nœuds ; réduction : 28.5%. La route relie les points saisis dans l’ordre.",
    "Distancia: Haversine, R = 3440 NM. Ahorro estimado de combustible: distancia de riesgo × 2.5 L/NM. Velocidad objetivo: 10 nudos; reducción: 28.5%. La ruta conecta los puntos introducidos en su orden."
  ],
  [
    "This report was generated using user measurements and the existing W-ALERTER model.",
    "Dieser Bericht wurde mit Nutzermesswerten und dem bestehenden W-ALERTER-Modell erstellt.",
    "Ce rapport a été produit à partir des mesures de l’utilisateur et du modèle W-ALERTER existant.",
    "Este informe se ha generado con las mediciones del usuario y el modelo W-ALERTER existente."
  ],
  [
    "delete voyage",
    "Fahrt löschen",
    "supprimer la traversée",
    "eliminar travesía"
  ],
  [
    "waypoints",
    "Wegpunkte",
    "points de passage",
    "puntos de paso"
  ],
  [
    "period",
    "Zeitraum",
    "période",
    "período"
  ],
  [
    "Reference",
    "Referenz",
    "Référence",
    "Referencia"
  ],
  [
    "Ratio",
    "Verhältnis",
    "Rapport",
    "Relación"
  ],
  [
    "Risk",
    "Risiko",
    "Risque",
    "Riesgo"
  ],
  [
    "Model indicator (%)",
    "Modellindikator (%)",
    "Indicateur du modèle (%)",
    "Indicador del modelo (%)"
  ],
  [
    "knots",
    "Knoten",
    "nœuds",
    "nudos"
  ],
  [
    "Analyze October",
    "Oktober analysieren",
    "Analyser octobre",
    "Analizar octubre"
  ],
  [
    "Analyze November",
    "November analysieren",
    "Analyser novembre",
    "Analizar noviembre"
  ],
  [
    "Analyze December",
    "Dezember analysieren",
    "Analyser décembre",
    "Analizar diciembre"
  ],
  [
    "Analyze January",
    "Januar analysieren",
    "Analyser janvier",
    "Analizar enero"
  ],
  [
    "Not supplied",
    "Nicht angegeben",
    "Non fourni",
    "No proporcionado"
  ],
  [
    "NOAA / Canada · Official source required",
    "NOAA / Kanada · Offizielle Quelle erforderlich",
    "NOAA / Canada · Source officielle requise",
    "NOAA / Canadá · Se requiere una fuente oficial"
  ],
  [
    "Source to be determined from the file",
    "Quelle wird anhand der Datei bestimmt",
    "Source à déterminer à partir du fichier",
    "La fuente se determinará a partir del archivo"
  ],
  [
    "Local file · Technical checks",
    "Lokale Datei · Technische Prüfung",
    "Fichier local · Contrôles techniques",
    "Archivo local · Comprobación técnica"
  ],
  [
    "Data not yet integrated",
    "Daten noch nicht integriert",
    "Données non encore intégrées",
    "Datos aún no integrados"
  ],
  [
    "SPECIES",
    "ART",
    "ESPÈCE",
    "ESPECIE"
  ],
  [
    "Model not connected",
    "Modell nicht angebunden",
    "Modèle non connecté",
    "Modelo no conectado"
  ],
  [
    "DATA DEPENDENCIES",
    "DATENABHÄNGIGKEITEN",
    "DÉPENDANCES DE DONNÉES",
    "DEPENDENCIAS DE DATOS"
  ],
  [
    "Planned combined inputs; a validated habitat model is not yet available.",
    "Geplante kombinierte Eingaben; ein validiertes Habitatmodell ist noch nicht verfügbar.",
    "Combinaison de données prévue ; aucun modèle d’habitat validé n’est encore disponible.",
    "Uso combinado de datos previsto; aún no hay un modelo de hábitat validado."
  ],
  [
    "Species-specific requirements await a documented method. Models are not reused across species automatically.",
    "Artspezifische Anforderungen benötigen eine dokumentierte Methode. Modelle werden nicht automatisch auf andere Arten übertragen.",
    "Les besoins propres à chaque espèce attendent une méthode documentée. Les modèles ne sont pas réutilisés automatiquement entre espèces.",
    "Los requisitos de cada especie requieren un método documentado. Los modelos no se aplican automáticamente a otras especies."
  ],
  [
    "Insufficient data for analysis",
    "Unzureichende Daten für eine Analyse",
    "Données insuffisantes pour l’analyse",
    "Datos insuficientes para el análisis"
  ],
  [
    "Awaiting data + method",
    "Daten + Methode ausstehend",
    "Données + méthode attendues",
    "Pendiente de datos + método"
  ],
  [
    "SOURCE METADATA",
    "QUELLENMETADATEN",
    "MÉTADONNÉES DE LA SOURCE",
    "METADATOS DE LA FUENTE"
  ],
  [
    "Provider",
    "Anbieter",
    "Fournisseur",
    "Proveedor"
  ],
  [
    "Product / version",
    "Produkt / Version",
    "Produit / version",
    "Producto / versión"
  ],
  [
    "Source URL",
    "Quellen-URL",
    "URL de la source",
    "URL de la fuente"
  ],
  [
    "Time coverage",
    "Zeitliche Abdeckung",
    "Couverture temporelle",
    "Cobertura temporal"
  ],
  [
    "Spatial coverage",
    "Räumliche Abdeckung",
    "Couverture géographique",
    "Cobertura geográfica"
  ],
  [
    "Coordinate system",
    "Koordinatensystem",
    "Système de coordonnées",
    "Sistema de coordenadas"
  ],
  [
    "Units",
    "Einheiten",
    "Unités",
    "Unidades"
  ],
  [
    "Resolution",
    "Auflösung",
    "Résolution",
    "Resolución"
  ],
  [
    "License",
    "Lizenz",
    "Licence",
    "Licencia"
  ],
  [
    "Original file",
    "Originaldatei",
    "Fichier original",
    "Archivo original"
  ],
  [
    "Source HTML SHA-256",
    "SHA-256 des Quell-HTML",
    "SHA-256 du fichier HTML source",
    "SHA-256 del HTML fuente"
  ],
  [
    "Source file SHA-256",
    "SHA-256 der Quelldatei",
    "SHA-256 du fichier source",
    "SHA-256 del archivo fuente"
  ],
  [
    "The supplied source describes Antarctica / Horseshoe Island. Exact coverage and years are unknown, so alignment with North Atlantic datasets cannot be established. This is not the metadata of a raw NASA product.",
    "Der bereitgestellte Quellcode beschreibt Antarktis / Horseshoe Island. Genaue Abdeckung und Jahre sind unbekannt; eine Abstimmung mit Nordatlantik-Daten ist daher nicht möglich. Dies sind keine Metadaten eines NASA-Rohprodukts.",
    "La source fournie décrit l’Antarctique / l’île Horseshoe. La couverture exacte et les années sont inconnues ; la compatibilité avec les données de l’Atlantique Nord ne peut donc pas être établie. Il ne s’agit pas des métadonnées d’un produit NASA brut.",
    "La fuente proporcionada describe la Antártida / isla Horseshoe. Se desconocen la cobertura exacta y los años, por lo que no se puede establecer la compatibilidad con datos del Atlántico Norte. No son los metadatos de un producto original de NASA."
  ],
  [
    "Technical acceptance does not establish scientific suitability. The original source file and transformations require separate review.",
    "Die technische Annahme bestätigt keine wissenschaftliche Eignung. Originalquelle und Transformationen müssen gesondert geprüft werden.",
    "L’acceptation technique ne garantit pas la pertinence scientifique. Le fichier source original et les transformations nécessitent un examen distinct.",
    "La aceptación técnica no garantiza la idoneidad científica. El archivo original y las transformaciones requieren una revisión aparte."
  ],
  [
    "Browser dataset storage is unavailable:",
    "Datenspeicher des Browsers nicht verfügbar:",
    "Stockage des données du navigateur indisponible :",
    "El almacenamiento de datos del navegador no está disponible:"
  ],
  [
    "Technical checks only · Not scientifically approved",
    "Nur technische Prüfung · Keine wissenschaftliche Freigabe",
    "Contrôles techniques uniquement · Sans validation scientifique",
    "Solo comprobación técnica · Sin validación científica"
  ],
  [
    "Metadata",
    "Metadaten",
    "Métadonnées",
    "Metadatos"
  ],
  [
    "Back up file",
    "Datei sichern",
    "Sauvegarder le fichier",
    "Guardar copia del archivo"
  ],
  [
    "Technical checks complete. Review required.",
    "Technische Prüfung abgeschlossen. Überprüfung erforderlich.",
    "Contrôles techniques terminés. Examen requis.",
    "Comprobación técnica completada. Se requiere revisión."
  ],
  [
    "A file-specific adapter is required.",
    "Ein dateispezifischer Adapter ist erforderlich.",
    "Un adaptateur propre au fichier est nécessaire.",
    "Se requiere un adaptador específico para el archivo."
  ],
  [
    "File not accepted.",
    "Datei nicht angenommen.",
    "Fichier non accepté.",
    "Archivo no aceptado."
  ],
  [
    "Records / missing values:",
    "Datensätze / fehlende Werte:",
    "Enregistrements / valeurs manquantes :",
    "Registros / valores ausentes:"
  ],
  [
    "Temporal and spatial compatibility with the legacy NASA references: unknown.",
    "Zeitliche und räumliche Kompatibilität mit bisherigen NASA-Referenzen: unbekannt.",
    "Compatibilité temporelle et géographique avec les références NASA classiques : inconnue.",
    "Compatibilidad temporal y geográfica con las referencias clásicas de NASA: desconocida."
  ],
  [
    "Technical details",
    "Technische Details",
    "Détails techniques",
    "Detalles técnicos"
  ],
  [
    "Inspecting file…",
    "Datei wird geprüft…",
    "Examen du fichier…",
    "Inspeccionando el archivo…"
  ],
  [
    "File saved in this browser. Scientific model use has not been approved.",
    "Datei in diesem Browser gespeichert. Wissenschaftliche Modellnutzung wurde nicht freigegeben.",
    "Fichier enregistré dans ce navigateur. Son utilisation dans un modèle scientifique n’a pas été approuvée.",
    "Archivo guardado en este navegador. Su uso en modelos científicos no está aprobado."
  ],
  [
    "Could not save:",
    "Speichern fehlgeschlagen:",
    "Enregistrement impossible :",
    "No se pudo guardar:"
  ],
  [
    "Select a dataset",
    "Datensatz auswählen",
    "Choisir un jeu de données",
    "Seleccionar un conjunto de datos"
  ],
  [
    "Awaiting data",
    "Daten ausstehend",
    "Données attendues",
    "Pendiente de datos"
  ],
  [
    "Data not yet integrated. Only the basemap is displayed.",
    "Daten noch nicht integriert. Es wird nur die Grundkarte angezeigt.",
    "Données non encore intégrées. Seul le fond de carte est affiché.",
    "Datos aún no integrados. Solo se muestra el mapa base."
  ],
  [
    "Could not read the dataset:",
    "Datensatz konnte nicht gelesen werden:",
    "Lecture du jeu de données impossible :",
    "No se pudo leer el conjunto de datos:"
  ],
  [
    "Map library could not be loaded.",
    "Kartenbibliothek konnte nicht geladen werden.",
    "La bibliothèque cartographique n’a pas pu être chargée.",
    "No se pudo cargar la biblioteca del mapa."
  ],
  [
    "Displayed source features / missing values:",
    "Angezeigte Quellelemente / fehlende Werte:",
    "Éléments sources affichés / valeurs manquantes :",
    "Elementos de origen mostrados / valores ausentes:"
  ],
  [
    "This selection exceeds the display limit. No records were silently dropped; a regional package or tile adapter is required.",
    "Diese Auswahl überschreitet die Darstellungsgrenze. Es wurden keine Datensätze stillschweigend entfernt; ein regionales Paket oder Kacheladapter ist erforderlich.",
    "Cette sélection dépasse la limite d’affichage. Aucun enregistrement n’a été supprimé silencieusement ; un paquet régional ou un adaptateur de tuiles est nécessaire.",
    "La selección supera el límite de visualización. No se han eliminado registros de forma silenciosa; se requiere un paquete regional o un adaptador de teselas."
  ],
  [
    "No valid measurements for this time and variable.",
    "Keine gültigen Messwerte für diese Zeit und Variable.",
    "Aucune mesure valide pour cette période et cette variable.",
    "No hay mediciones válidas para este momento y variable."
  ],
  [
    "Source",
    "Quelle",
    "Source",
    "Fuente"
  ],
  [
    "Variable",
    "Variable",
    "Variable",
    "Variable"
  ],
  [
    "Time",
    "Zeit",
    "Heure",
    "Hora"
  ],
  [
    "Review",
    "Überprüfung",
    "Examen",
    "Revisión"
  ],
  [
    "Technical checks · Not scientifically approved",
    "Technische Prüfung · Keine wissenschaftliche Freigabe",
    "Contrôles techniques · Sans validation scientifique",
    "Comprobación técnica · Sin validación científica"
  ],
  [
    "Sea surface temperature",
    "Meeresoberflächentemperatur",
    "Température de surface de la mer",
    "Temperatura superficial del mar"
  ],
  [
    "Ocean currents",
    "Meeresströmungen",
    "Courants océaniques",
    "Corrientes oceánicas"
  ],
  [
    "Raw chlorophyll-a fields",
    "Chlorophyll-a-Rohdatenfelder",
    "Champs bruts de chlorophylle-a",
    "Campos originales de clorofila-a"
  ],
  [
    "Ocean colour & phytoplankton",
    "Ozeanfarbe & Phytoplankton",
    "Couleur de l’océan et phytoplancton",
    "Color del océano y fitoplancton"
  ],
  [
    "Calanus & prey resources",
    "Calanus & Nahrungsressourcen",
    "Calanus et ressources alimentaires",
    "Calanus y recursos alimentarios"
  ],
  [
    "Species observations",
    "Artenbeobachtungen",
    "Observations d’espèces",
    "Observaciones de especies"
  ],
  [
    "Acoustic detections",
    "Akustische Erfassungen",
    "Détections acoustiques",
    "Detecciones acústicas"
  ],
  [
    "Satellite tracking",
    "Satellitenverfolgung",
    "Suivi satellitaire",
    "Seguimiento por satélite"
  ],
  [
    "AIS vessel movements",
    "AIS-Schiffsbewegungen",
    "Mouvements AIS des navires",
    "Movimientos de buques AIS"
  ],
  [
    "Protection & speed regulations",
    "Schutz- & Geschwindigkeitsregeln",
    "Protection et règles de vitesse",
    "Protección y normas de velocidad"
  ],
  [
    "North Atlantic right whale",
    "Atlantischer Nordkaper",
    "Baleine franche de l’Atlantique Nord",
    "Ballena franca del Atlántico Norte"
  ],
  [
    "Humpback whale",
    "Buckelwal",
    "Baleine à bosse",
    "Ballena jorobada"
  ],
  [
    "Loggerhead sea turtle",
    "Unechte Karettschildkröte",
    "Tortue caouanne",
    "Tortuga boba"
  ],
  [
    "Short-beaked common dolphin",
    "Kurzschnäuziger Gemeiner Delfin",
    "Dauphin commun à bec court",
    "Delfín común de hocico corto"
  ],
  [
    "Move waypoint $1 up",
    "Wegpunkt $1 nach oben",
    "Monter le point $1",
    "Subir el punto $1"
  ],
  [
    "Move waypoint $1 down",
    "Wegpunkt $1 nach unten",
    "Descendre le point $1",
    "Bajar el punto $1"
  ],
  [
    "Edit waypoint $1",
    "Wegpunkt $1 bearbeiten",
    "Modifier le point $1",
    "Editar el punto $1"
  ],
  [
    "Remove waypoint $1",
    "Wegpunkt $1 entfernen",
    "Supprimer le point $1",
    "Eliminar el punto $1"
  ],
  [
    "Waypoint $1",
    "Wegpunkt $1",
    "Point de passage $1",
    "Punto de paso $1"
  ],
  [
    "Compare chlorophyll-a observations against monthly references, assess regional risk and plan your voyages with W-ALERTER.",
    "Chlorophyll-a-Beobachtungen mit monatlichen Referenzen vergleichen, regionale Risiken bewerten und Fahrten mit W-ALERTER planen.",
    "Comparez les observations de chlorophylle-a aux références mensuelles, évaluez le risque régional et planifiez vos traversées avec W-ALERTER.",
    "Compara las observaciones de clorofila-a con las referencias mensuales, evalúa el riesgo regional y planifica tus travesías con W-ALERTER."
  ],
  [
    "English",
    "English",
    "English",
    "English"
  ],
  [
    "Deutsch",
    "Deutsch",
    "Deutsch",
    "Deutsch"
  ],
  [
    "Français",
    "Français",
    "Français",
    "Français"
  ],
  [
    "Español",
    "Español",
    "Español",
    "Español"
  ],
  [
    "Collision risk",
    "Kollisionsrisiko",
    "Risque de collision",
    "Riesgo de colisión"
  ],
  [
    "Habitat sensitivity",
    "Habitatempfindlichkeit",
    "Sensibilité de l’habitat",
    "Sensibilidad del hábitat"
  ],
  [
    "Vessel speed",
    "Schiffsgeschwindigkeit",
    "Vitesse du navire",
    "Velocidad del buque"
  ],
  [
    "Route distance",
    "Routendistanz",
    "Distance de la route",
    "Distancia de la ruta"
  ],
  [
    "Travel time",
    "Reisedauer",
    "Durée du trajet",
    "Duración del viaje"
  ],
  [
    "Fuel consumption",
    "Kraftstoffverbrauch",
    "Consommation de carburant",
    "Consumo de combustible"
  ],
  [
    "CO₂ emissions",
    "CO₂-Emissionen",
    "Émissions de CO₂",
    "Emisiones de CO₂"
  ],
  [
    "Protection & speed limits",
    "Schutz- & Geschwindigkeitsgrenzen",
    "Protection et limites de vitesse",
    "Protección y límites de velocidad"
  ],
  [
    "Time-dependent environment",
    "Zeitabhängige Umweltbedingungen",
    "Environnement variable dans le temps",
    "Entorno variable en el tiempo"
  ],
  [
    "Could not read the file:",
    "Datei konnte nicht gelesen werden:",
    "Lecture du fichier impossible :",
    "No se pudo leer el archivo:"
  ],
  [
    "A source file is required",
    "Eine Quelldatei ist erforderlich",
    "Un fichier source est requis",
    "Se requiere un archivo fuente"
  ],
  [
    "Select a nonempty file up to 25 MB; larger scientific files require an offline adapter",
    "Nicht leere Datei bis 25 MB auswählen; größere wissenschaftliche Dateien benötigen einen Offline-Adapter",
    "Choisissez un fichier non vide de 25 Mo maximum ; les fichiers scientifiques plus volumineux nécessitent un adaptateur hors ligne",
    "Selecciona un archivo no vacío de hasta 25 MB; los archivos científicos más grandes requieren un adaptador sin conexión"
  ],
  [
    "This source format needs a file-specific adapter. No records were imported.",
    "Dieses Quellformat benötigt einen dateispezifischen Adapter. Es wurden keine Datensätze importiert.",
    "Ce format source nécessite un adaptateur propre au fichier. Aucun enregistrement n’a été importé.",
    "Este formato de origen requiere un adaptador específico. No se ha importado ningún registro."
  ],
  [
    "The file is not valid UTF-8 JSON",
    "Die Datei ist kein gültiges UTF-8-JSON",
    "Le fichier n’est pas un JSON UTF-8 valide",
    "El archivo no es un JSON UTF-8 válido"
  ],
  [
    "The dataset package did not pass technical validation",
    "Das Datenpaket hat die technische Prüfung nicht bestanden",
    "Le paquet de données n’a pas réussi la validation technique",
    "El paquete de datos no ha superado la validación técnica"
  ],
  [
    "Browser dataset storage is unavailable",
    "Datenspeicher des Browsers nicht verfügbar",
    "Stockage des données du navigateur indisponible",
    "El almacenamiento de datos del navegador no está disponible"
  ],
  [
    "Close other W-ALERTER tabs to open dataset storage",
    "Andere W-ALERTER-Tabs schließen, um den Datenspeicher zu öffnen",
    "Fermez les autres onglets W-ALERTER pour ouvrir le stockage des données",
    "Cierra las demás pestañas de W-ALERTER para abrir el almacenamiento de datos"
  ],
  [
    "A reviewed original package is required",
    "Ein überprüftes Originalpaket ist erforderlich",
    "Un paquet original examiné est requis",
    "Se requiere un paquete original revisado"
  ],
  [
    "The package changed. Inspect it again before saving.",
    "Das Paket wurde geändert. Vor dem Speichern erneut prüfen.",
    "Le paquet a changé. Examinez-le à nouveau avant l’enregistrement.",
    "El paquete ha cambiado. Inspecciónalo de nuevo antes de guardar."
  ],
  [
    "Dataset save was rolled back; no existing data was replaced.",
    "Speichern des Datensatzes zurückgerollt; bestehende Daten wurden nicht ersetzt.",
    "L’enregistrement a été annulé ; aucune donnée existante n’a été remplacée.",
    "Se ha revertido el guardado; no se han reemplazado los datos existentes."
  ],
  [
    "Expected a dataset object",
    "Datensatzobjekt erwartet",
    "Objet de jeu de données attendu",
    "Se esperaba un objeto de conjunto de datos"
  ],
  [
    "Unsupported package format or schema version",
    "Nicht unterstütztes Paketformat oder Schema",
    "Format de paquet ou version de schéma non pris en charge",
    "Formato de paquete o versión de esquema no compatible"
  ],
  [
    "Dataset metadata is required",
    "Datensatz-Metadaten erforderlich",
    "Métadonnées du jeu de données requises",
    "Se requieren metadatos del conjunto de datos"
  ],
  [
    "Use a stable 3–101 character identifier",
    "Stabile Kennung mit 3–101 Zeichen verwenden",
    "Utilisez un identifiant stable de 3–101 caractères",
    "Usa un identificador estable de 3–101 caracteres"
  ],
  [
    "A title is required",
    "Titel erforderlich",
    "Titre requis",
    "Se requiere un título"
  ],
  [
    "Unknown data kind",
    "Unbekannter Datentyp",
    "Type de données inconnu",
    "Tipo de datos desconocido"
  ],
  [
    "A named source provider is required",
    "Benannter Quellenanbieter erforderlich",
    "Fournisseur source nommé requis",
    "Se requiere un proveedor de origen identificado"
  ],
  [
    "Supply a string or explicit null",
    "Zeichenfolge oder explizites null angeben",
    "Indiquez une chaîne ou un null explicite",
    "Proporciona una cadena o un null explícito"
  ],
  [
    "An HTTPS source URL is required",
    "HTTPS-Quellen-URL erforderlich",
    "URL source HTTPS requise",
    "Se requiere una URL de origen HTTPS"
  ],
  [
    "A valid EPSG:4326 bbox is required; split antimeridian extents upstream",
    "Gültige EPSG:4326-Bounding-Box erforderlich; Ausdehnungen über den Antimeridian vorher aufteilen",
    "Une emprise EPSG:4326 valide est requise ; scindez en amont les emprises traversant l’antiméridien",
    "Se requiere una extensión EPSG:4326 válida; divide antes las extensiones que cruzan el antimeridiano"
  ],
  [
    "Valid ordered UTC timestamps are required",
    "Gültige, geordnete UTC-Zeitstempel erforderlich",
    "Horodatages UTC valides et ordonnés requis",
    "Se requieren marcas de tiempo UTC válidas y ordenadas"
  ],
  [
    "Unsupported calendar; an explicit adapter is required",
    "Nicht unterstützter Kalender; expliziter Adapter erforderlich",
    "Calendrier non pris en charge ; adaptateur explicite requis",
    "Calendario no compatible; se requiere un adaptador explícito"
  ],
  [
    "Describe spatial and temporal resolution, or use explicit null",
    "Räumliche und zeitliche Auflösung beschreiben oder explizites null verwenden",
    "Décrivez la résolution spatiale et temporelle ou utilisez un null explicite",
    "Describe la resolución espacial y temporal o usa un null explícito"
  ],
  [
    "Missing values must remain explicit null",
    "Fehlende Werte müssen explizit null bleiben",
    "Les valeurs manquantes doivent rester des null explicites",
    "Los valores ausentes deben permanecer como null explícito"
  ],
  [
    "List exact scientific names, or an empty array",
    "Exakte wissenschaftliche Namen oder leere Liste angeben",
    "Indiquez les noms scientifiques exacts ou une liste vide",
    "Indica los nombres científicos exactos o una lista vacía"
  ],
  [
    "Original filename, SHA-256 and transformation history are required",
    "Originaldateiname, SHA-256 und Transformationsverlauf erforderlich",
    "Nom du fichier original, SHA-256 et historique des transformations requis",
    "Se requieren el nombre del archivo original, SHA-256 y el historial de transformaciones"
  ],
  [
    "Provide 1–64 variable definitions",
    "1–64 Variablendefinitionen angeben",
    "Fournissez 1–64 définitions de variables",
    "Proporciona 1–64 definiciones de variables"
  ],
  [
    "Variable key, units and standardName (or null) are required",
    "Variablenschlüssel, Einheiten und standardName (oder null) erforderlich",
    "Clé de variable, unités et standardName (ou null) requis",
    "Se requieren la clave de variable, las unidades y standardName (o null)"
  ],
  [
    "Duplicate variable key",
    "Doppelter Variablenschlüssel",
    "Clé de variable en double",
    "Clave de variable duplicada"
  ],
  [
    "A source-documented numeric range is required",
    "Durch die Quelle belegter numerischer Bereich erforderlich",
    "Plage numérique documentée par la source requise",
    "Se requiere un rango numérico documentado por la fuente"
  ],
  [
    "Timestamp is invalid or outside the declared interval",
    "Zeitstempel ungültig oder außerhalb des angegebenen Zeitraums",
    "Horodatage invalide ou hors de la période déclarée",
    "Marca de tiempo no válida o fuera del intervalo declarado"
  ],
  [
    "Values object is required; missing measurements must be null",
    "Werteobjekt erforderlich; fehlende Messwerte müssen null sein",
    "Objet de valeurs requis ; les mesures manquantes doivent être null",
    "Se requiere un objeto de valores; las mediciones ausentes deben ser null"
  ],
  [
    "Undeclared variable",
    "Nicht deklarierte Variable",
    "Variable non déclarée",
    "Variable no declarada"
  ],
  [
    "A finite number or explicit null is required",
    "Endliche Zahl oder explizites null erforderlich",
    "Nombre fini ou null explicite requis",
    "Se requiere un número finito o un null explícito"
  ],
  [
    "Outside the declared source range",
    "Außerhalb des angegebenen Quellenbereichs",
    "Hors de la plage déclarée par la source",
    "Fuera del rango declarado por la fuente"
  ],
  [
    "Expected [longitude, latitude] within the declared bbox",
    "[Längengrad, Breitengrad] innerhalb der angegebenen Bounding-Box erwartet",
    "[longitude, latitude] attendues dans l’emprise déclarée",
    "Se esperaba [longitud, latitud] dentro de la extensión declarada"
  ],
  [
    "Geometry has too few coordinates",
    "Geometrie hat zu wenige Koordinaten",
    "La géométrie contient trop peu de coordonnées",
    "La geometría tiene muy pocas coordenadas"
  ],
  [
    "Polygon ring must be closed",
    "Polygonring muss geschlossen sein",
    "L’anneau du polygone doit être fermé",
    "El anillo del polígono debe estar cerrado"
  ],
  [
    "Polygon rings are required",
    "Polygonringe erforderlich",
    "Anneaux de polygone requis",
    "Se requieren anillos de polígono"
  ],
  [
    "Geometry is required",
    "Geometrie erforderlich",
    "Géométrie requise",
    "Se requiere una geometría"
  ],
  [
    "Unsupported or empty geometry",
    "Nicht unterstützte oder leere Geometrie",
    "Géométrie vide ou non prise en charge",
    "Geometría vacía o no compatible"
  ],
  [
    "Provide 1–100000 source records",
    "1–100000 Quelldatensätze angeben",
    "Fournissez 1–100000 enregistrements sources",
    "Proporciona 1–100000 registros de origen"
  ],
  [
    "Expected a source record",
    "Quelldatensatz erwartet",
    "Enregistrement source attendu",
    "Se esperaba un registro de origen"
  ],
  [
    "A nonempty FeatureCollection of at most 100000 features is required",
    "Nicht leere FeatureCollection mit höchstens 100000 Elementen erforderlich",
    "Une FeatureCollection non vide de 100000 éléments maximum est requise",
    "Se requiere una FeatureCollection no vacía con un máximo de 100000 elementos"
  ],
  [
    "Expected a GeoJSON Feature",
    "GeoJSON-Feature erwartet",
    "Entité GeoJSON attendue",
    "Se esperaba un elemento GeoJSON"
  ],
  [
    "Only points and geojson packages are supported by this adapter",
    "Dieser Adapter unterstützt nur Punkte- und GeoJSON-Pakete",
    "Cet adaptateur ne prend en charge que les paquets points et GeoJSON",
    "Este adaptador solo admite paquetes de puntos y GeoJSON"
  ],
  [
    "Some resolution metadata is not supplied",
    "Einige Auflösungsmetadaten fehlen",
    "Certaines métadonnées de résolution sont absentes",
    "Faltan algunos metadatos de resolución"
  ],
  [
    "Coincident records require review; none have been merged",
    "Zusammenfallende Datensätze müssen geprüft werden; keine wurden zusammengeführt",
    "Les enregistrements coïncidents doivent être examinés ; aucun n’a été fusionné",
    "Los registros coincidentes requieren revisión; no se ha fusionado ninguno"
  ],
  [
    "Technical validation does not establish scientific validity or model suitability",
    "Technische Validierung bestätigt weder wissenschaftliche Gültigkeit noch Modelleignung",
    "La validation technique ne garantit ni la validité scientifique ni l’aptitude au modèle",
    "La validación técnica no garantiza la validez científica ni la idoneidad para un modelo"
  ],
  [
    "No valid measured values; no analysis or measured layer can be produced",
    "Keine gültigen Messwerte; keine Analyse oder Messebene möglich",
    "Aucune mesure valide ; aucune analyse ni couche de mesures ne peut être produite",
    "No hay mediciones válidas; no se puede generar un análisis ni una capa de mediciones"
  ],
  [
    "This identifier or exact file is already saved. Use a new identifier for a new version.",
    "Diese Kennung oder exakte Datei ist bereits gespeichert. Für eine neue Version eine neue Kennung verwenden.",
    "Cet identifiant ou ce fichier exact est déjà enregistré. Utilisez un nouvel identifiant pour une nouvelle version.",
    "Este identificador o archivo exacto ya está guardado. Usa otro identificador para una nueva versión."
  ],
  [
    "The dataset could not be saved. Browser storage may be full.",
    "Datensatz konnte nicht gespeichert werden. Der Browserspeicher ist möglicherweise voll.",
    "Le jeu de données n’a pas pu être enregistré. Le stockage du navigateur est peut-être plein.",
    "No se pudo guardar el conjunto de datos. El almacenamiento del navegador podría estar lleno."
  ],
  [
    "Dataset is unavailable",
    "Datensatz nicht verfügbar",
    "Jeu de données indisponible",
    "Conjunto de datos no disponible"
  ],
  [
    "Original package is unavailable",
    "Originalpaket nicht verfügbar",
    "Paquet original indisponible",
    "Paquete original no disponible"
  ],
  [
    "attribution in supplied source",
    "Zuordnung im bereitgestellten Quellcode",
    "attribution dans le code source fourni",
    "atribución en el código fuente proporcionado"
  ],
  [
    "monthly reference constants; years unspecified",
    "monatliche Referenzkonstanten; Jahre nicht angegeben",
    "constantes mensuelles de référence ; années non précisées",
    "constantes mensuales de referencia; años no especificados"
  ],
  [
    "Source productId is not supplied",
    "Produktkennung der Quelle fehlt",
    "L’identifiant du produit source est absent",
    "No se ha proporcionado el identificador del producto de origen"
  ],
  [
    "Source license is not supplied",
    "Quellenlizenz fehlt",
    "La licence de la source est absente",
    "No se ha proporcionado la licencia de la fuente"
  ],
  [
    "Workspace navigation",
    "Arbeitsbereich-Navigation",
    "Navigation de l’espace de travail",
    "Navegación del área de trabajo"
  ],
  [
    "Data sections",
    "Datenbereiche",
    "Rubriques de données",
    "Secciones de datos"
  ],
  [
    "Route",
    "Route",
    "Route",
    "Ruta"
  ],
  [
    "Data",
    "Daten",
    "Données",
    "Datos"
  ],
  [
    "Sources",
    "Quellen",
    "Sources",
    "Fuentes"
  ],
  [
    "Species",
    "Arten",
    "Espèces",
    "Especies"
  ],
  [
    "Method",
    "Methode",
    "Méthode",
    "Método"
  ],
  [
    "Back to overview",
    "Zur Übersicht",
    "Retour à l’accueil",
    "Volver al inicio"
  ],
  [
    "Map, routes and data in one workspace.",
    "Karte, Routen und Daten in einem Arbeitsbereich.",
    "Carte, routes et données dans un même espace.",
    "Mapa, rutas y datos en una misma área de trabajo."
  ],
  [
    "Add a file",
    "Datei hinzufügen",
    "Ajouter un fichier",
    "Añadir un archivo"
  ],
  [
    "Close dialog",
    "Fenster schließen",
    "Fermer la fenêtre",
    "Cerrar la ventana"
  ],
  [
    "Existing reference",
    "Bestehende Referenz",
    "Référence existante",
    "Referencia existente"
  ],
  [
    "Layers",
    "Ebenen",
    "Couches",
    "Capas"
  ],
  [
    "Basemap",
    "Grundkarte",
    "Fond de carte",
    "Mapa base"
  ],
  [
    "Location model",
    "Standortmodell",
    "Modèle de position",
    "Modelo de ubicación"
  ],
  [
    "Route calculation",
    "Routenberechnung",
    "Calcul de route",
    "Cálculo de ruta"
  ],
  [
    "Existing route calculation",
    "Bestehende Routenberechnung",
    "Calcul de route existant",
    "Cálculo de ruta existente"
  ],
  [
    "The calculation method is not connected yet.",
    "Die Berechnungsmethode ist noch nicht angebunden.",
    "La méthode de calcul n’est pas encore connectée.",
    "El método de cálculo aún no está conectado."
  ],
  [
    "Data requirements",
    "Datenanforderungen",
    "Besoins en données",
    "Requisitos de datos"
  ],
  [
    "No saved voyages yet.",
    "Noch keine gespeicherten Fahrten.",
    "Aucune traversée enregistrée.",
    "Aún no hay travesías guardadas."
  ],
  [
    "No observations yet.",
    "Noch keine Beobachtungen.",
    "Aucune observation pour le moment.",
    "Aún no hay observaciones."
  ],
  [
    "Your saved routes appear here.",
    "Gespeicherte Routen erscheinen hier.",
    "Vos routes enregistrées s’affichent ici.",
    "Tus rutas guardadas aparecerán aquí."
  ],
  [
    "Your location analyses are stored here.",
    "Ihre Standortanalysen werden hier gespeichert.",
    "Vos analyses de position sont conservées ici.",
    "Tus análisis de ubicación se guardan aquí."
  ],
  [
    "Technical details",
    "Technische Details",
    "Détails techniques",
    "Detalles técnicos"
  ],
  [
    "North Atlantic map",
    "Karte des Nordatlantiks",
    "Carte de l’Atlantique Nord",
    "Mapa del Atlántico Norte"
  ]
];
return Object.freeze(Object.fromEntries(['de','fr','es'].map((language,index)=>[language,Object.freeze(Object.fromEntries(rows.map(row=>[row[0],row[index+1]])))])));
})();
