/* 

Diese Datei verarbeitet ausschließlich Daten:

- Es sendet die aktuellen Filter eines Aufrufs an api_opfer.
- Es empfängt die Daten und übergibt ein Daten-Paket an den Dashboard-Controller
*/

const DataService = {
  // Hier werden die Cache-Daten gespeichert
  state: {
    geoJSON: null, // Karten-Geometrie
    requestCache: {}, // Cache
  },

  getAllLandkreisNamesFromJson: function () {
    if (!this.state.geoJSON) return [];
    // wir extrahieren alle eindeutigen Landkreisnamen aus dem GeoJSON
    const names = this.state.geoJSON.features.map((feature) => feature.properties.name_2);
    return [...new Set(names)].sort();
  },


  /* Lädt die Karten-Datei (GeoJSON) */
  loadMapGeometryFromJson: async function () {
    if (this.state.geoJSON) return this.state.geoJSON;
    try {
      let response = await fetch("data/landkreise-in-germany-optimized.json");
      let data = await response.json();
      this.state.geoJSON = data;
      return data;
    } catch (e) {
      console.error("Error loading GeoJSON:", e);
    }
  },


  /**
   * Hauptfunktion: Lädt alles Notwendige.
   * Gibt ein Versprechen zurück, damit die Karte weiß, wann sie beginnen soll.
   */
  getDataFromDatabase: async function (filters = {}) {
    // Parameters für Cache und Aufruf URL
    const params = new URLSearchParams();
    if (filters.jahr && filters.jahr !== "all") params.append("jahr", filters.jahr);
    if (filters.geschlecht && filters.geschlecht !== "all") params.append("geschlecht", filters.geschlecht);
    if (filters.straftat && filters.straftat !== "") params.append("straftat", filters.straftat);
    if (filters.landkreis && filters.landkreis !== "") params.append("landkreis", filters.landkreis);
    if (filters.altersgruppe && filters.altersgruppe !== "all") params.append("altersgruppe", filters.altersgruppe);
    if (filters.groupBy) params.append("groupBy", filters.groupBy);

    const parametersForURL = params.toString(); // Für unsere dictionary-Zwischenspeicherung

    // Cache lesen und falls möglich, nur Daten von Cache ausgeben und Funktion beenden
    if (this.state.requestCache[parametersForURL]) {
      return this.state.requestCache[parametersForURL];
    }

    // URL zusammensetzen
    const URL = `includes/api_opfer.php?${parametersForURL}`;

    try {
      // Daten aufrufen
      const response = await fetch(URL);
      const rawData = await response.json();

      // Wir machen ein Paket mit allen wichtigen Informationen.
      let resultPackage = { rawData: rawData };

      // Wenn Daten für Karte abgefragt werden sollen
      const datenFurKarteNotwendig = !filters.groupBy || filters.groupBy === "landkreis";

      // Prozessieren bei der Client (Für die Karte gruppieren)
      // Wir wandeln die rohen Daten in ein schneller zu nutzendes Format um. (Index Objekt)
      // Das ist notwendig, damit die Karte schnell auf die Daten zugreifen kann.
      if (datenFurKarteNotwendig) {
        const index = {};
        rawData.forEach((item) => {
          if (item.id) {
            const gemeindeSchluessel = String(item.id).padStart(5, "0");
            const val = parseInt(item.value || 0);
            if (!index[gemeindeSchluessel]) index[gemeindeSchluessel] = 0;
            index[gemeindeSchluessel] += val;
          }
        });
        
        // Wir machen ein Paket mit Index und GeoJson Daten für die Karte
        resultPackage.opferIndex = index;
        resultPackage.geoJSON = this.state.geoJSON;
      }
      
      // Paket im Cache speichern, damit wir es beim nächsten Mal schneller haben
      this.state.requestCache[parametersForURL] = resultPackage;
      
      // Alles ausgeben
      return resultPackage;
    } catch (err) {
      console.error("Error in getDataFromDatabase:", err);
      return null;
    }
  },


  // Landkreisnamen Normalisierung
  cleanLandkreiseTextForDatabaseMatching: function (name) {
    if (!name) return "";
    let n = name.toLowerCase().trim();

    const noiseWords = [" städte", ", stadt", " landkreis", " kreis", " stadtkreis"," (saale)"];

    noiseWords.forEach((suffix) => {
      if (n.endsWith(suffix)) n = n.replace(suffix, "").trim();
    });;

    return n;
  },

};
