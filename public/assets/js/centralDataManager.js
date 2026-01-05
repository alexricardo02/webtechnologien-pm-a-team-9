/* Ist dafür zuständig, Daten EINMAL zu laden und sie an diejenigen weiterzugeben, die sie anfordern. */

const DataManager = {
  // Hier werden die Daten gespeichert
  state: {
    geoJSON: null, // Karte GeoJSON
    requestCache: {},
  },

  getLandkreisNames: function () {
    if (!this.state.geoJSON) return [];
    // wir extrahieren alle eindeutigen Landkreisnamen aus dem GeoJSON
    const names = this.state.geoJSON.features.map((f) => f.properties.name_2);
    return [...new Set(names)].sort();
  },

  initGeo: async function () {
    if (this.state.geoJSON) return this.state.geoJSON;
    try {
      const res = await fetch("data/landkreise-in-germany-optimized.json");
      this.state.geoJSON = await res.json();
      return this.state.geoJSON;
    } catch (e) {
      console.error("Error loading GeoJSON:", e);
    }
  },
  /**
   * Hauptfunktion: Lädt alles Notwendige.
   * Gibt ein Versprechen zurück, damit die Karte weiß, wann sie beginnen soll.
   */

  fetchFilteredData: async function (filters = {}) {
    const params = new URLSearchParams();
    if (filters.jahr && filters.jahr !== "all")
      params.append("jahr", filters.jahr);
    if (filters.geschlecht && filters.geschlecht !== "all")
      params.append("geschlecht", filters.geschlecht);
    if (filters.straftat && filters.straftat !== "all")
      params.append("straftat", filters.straftat);
    if (filters.landkreis && filters.landkreis !== "all")
      params.append("landkreis", filters.landkreis);
    if (filters.altersgruppe && filters.altersgruppe !== "all")
      params.append("altersgruppe", filters.altersgruppe);

    const cacheKey = params.toString(); // Für unsere dictionary-Zwischenspeicherung

    // B. Cache lesen
    if (this.state.requestCache[cacheKey]) {
      return this.state.requestCache[cacheKey];
    }

    const url = `includes/api_opfer.php?${cacheKey}`;

    try {
      const response = await fetch(url);
      const rawData = await response.json();

      // 3. Prozessieren bei der Client (Für die Karte gruppieren)
      // Wir wandeln die rohen Daten in ein schneller zu nutzendes Format um. (Objekt)
      // Das ist notwendig, damit die Karte schnell auf die Daten zugreifen kann.
      const index = {};
      rawData.forEach((item) => {
        if (item.id) {
          // padStart(5, '0') wandelt 5315 en "05315" und behält 11000 als "11000"
          const ags = String(item.id).padStart(5, "0");
          const val = parseInt(item.value || 0);

          if (!index[ags]) index[ags] = 0;
          index[ags] += val;
        }
      });

      const resultState = {
        rawData: rawData,
        opferIndex: index,
        geoJSON: this.state.geoJSON,
      };

      this.state.requestCache[cacheKey] = resultState;
      // 4. Alles ausgeben
      return resultState;
    } catch (err) {
      console.error("Error in fetchFilteredData:", err);
      return null;
    }
  },

  nameMapping: {
    hanover: "region hannover",
    "aschersleben-staßfurt": "aschersleben-stassfurt", // Manejo de ß -> ss
    lauenburg: "herzogtum lauenburg",
  },

  // Landkreisnamen Normalisierung
  normalizeName: function (name) {
    if (!name) return "";
    let n = name.toLowerCase().trim();

    if (this.nameMapping[n]) {
      return this.nameMapping[n];
    }

    const noise = [
      " städte",
      ", stadt",
      " landkreis",
      " kreis",
      " stadtkreis",
      " (saale)",
    ];
    noise.forEach((suffix) => {
      if (n.endsWith(suffix)) n = n.replace(suffix, "").trim();
    });

    // 3. Normalizierung
    n = n.replace(/ß/g, "ss");

    return n;
  },

  landkreisSuchFunktion: function (data, selectedLandkreise) {
    if (!selectedLandkreise || selectedLandkreise.size === 0) return data;

    const normalizedSelected = new Set(
      Array.from(selectedLandkreise).map((s) => this.normalizeName(s))
    );

    return data.filter((item) => {
      const itemName = this.normalizeName(item.name);
      return normalizedSelected.has(itemName);
    });
  },
};
