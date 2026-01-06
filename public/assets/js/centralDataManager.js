/* Ist dafür zuständig, Daten EINMAL zu laden und sie an diejenigen weiterzugeben, die sie anfordern. */

const DataManager = {
  // Hier werden die Daten gespeichert
  state: {
    geoJSON: null, // Karten-Geometrie
    requestCache: {},
  },

  getLandkreisNames: function () {
    if (!this.state.geoJSON) return [];
    // wir extrahieren alle eindeutigen Landkreisnamen aus dem GeoJSON
    const names = this.state.geoJSON.features.map((feature) => feature.properties.name_2);
    return [...new Set(names)].sort();
  },


  /* Lädt die Karten-Datei (GeoJSON) */
  initGeo: async function () {
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
    const params = new URLSearchParams();
    if (filters.jahr && filters.jahr !== "all") params.append("jahr", filters.jahr);
    if (filters.geschlecht && filters.geschlecht !== "all") params.append("geschlecht", filters.geschlecht);
    if (filters.straftat && filters.straftat !== "all") params.append("straftat", filters.straftat);
    if (filters.landkreis && filters.landkreis !== "all") params.append("landkreis", filters.landkreis);
    if (filters.altersgruppe && filters.altersgruppe !== "all") params.append("altersgruppe", filters.altersgruppe);

    const cacheKey = params.toString(); // Für unsere dictionary-Zwischenspeicherung

    // Cache lesen
    if (this.state.requestCache[cacheKey]) {
      return this.state.requestCache[cacheKey];
    }

    const url = `includes/api_opfer.php?${cacheKey}`;

    try {
      const response = await fetch(url);
      const rawData = await response.json();

      // Prozessieren bei der Client (Für die Karte gruppieren)
      // Wir wandeln die rohen Daten in ein schneller zu nutzendes Format um. (Objekt)
      // Das ist notwendig, damit die Karte schnell auf die Daten zugreifen kann.
      const index = {};
      rawData.forEach((item) => {
        if (item.id) {
          // padStart(5, '0') wandelt 5315 in "05315" und behält 11000 als "11000"
          const gemeindeSchluessel = String(item.id).padStart(5, "0");
          const val = parseInt(item.value || 0);

          if (!index[gemeindeSchluessel]) index[gemeindeSchluessel] = 0;
          index[gemeindeSchluessel] += val;
        }
      });

      // Wir schnüren ein Paket mit allen wichtigen Informationen
      const resultPackage = {
        rawData: rawData,
        opferIndex: index,
        geoJSON: this.state.geoJSON,
      };
      
      // Paket im Cache speichern, damit wir es beim nächsten Mal schneller haben
      this.state.requestCache[cacheKey] = resultPackage;
      
      // Alles ausgeben
      return resultPackage;
    } catch (err) {
      console.error("Error in getDataFromDatabase:", err);
      return null;
    }
  },


  // Landkreisnamen Normalisierung
  cleanTextForDatabaseMatching: function (name) {
    if (!name) return "";
    let n = name.toLowerCase().trim();

    const noiseWords = [" städte", ", stadt", " landkreis", " kreis", " stadtkreis"," (saale)"];

    noiseWords.forEach((suffix) => {
      if (n.endsWith(suffix)) n = n.replace(suffix, "").trim();
    });;

    return n;
  },

  landkreisSuchFunktion: function (data, selectedLandkreise) {
    if (!selectedLandkreise || selectedLandkreise.size === 0) return data;

    const normalizedSelected = new Set(
      Array.from(selectedLandkreise).map((s) => this.cleanTextForDatabaseMatching(s))
    );

    return data.filter((item) => {
      const itemName = this.cleanTextForDatabaseMatching(item.name);
      return normalizedSelected.has(itemName);
    });
  },
};
