/* Ist dafür zuständig, Daten EINMAL zu laden und sie an diejenigen weiterzugeben, die sie anfordern. */

const DataManager = {
  state: {
    geoJSON: null, // Karte GeoJSON
    requestCache: {},
  },


  /**
   * Liefert alle eindeutigen Landkreisnamen aus dem GeoJSON zurück.
   * Wenn das GeoJSON noch nicht geladen wurde, wird ein leeres Array zurückgegeben.
   */
  getLandkreisNames: function () {
    if (!this.state.geoJSON) return [];
    const names = this.state.geoJSON.features.map((f) => f.properties.NAME_3);
    return [...new Set(names)].sort(); // Wir konvertieren die Namen in ein Set, um Duplikate zu entfernen
  },

  /**
   * Initializes the GeoJSON data.
   * If the GeoJSON data is already loaded, it simply returns the cached data.
   * Otherwise, it fetches the GeoJSON data from the server and caches it.
   */
  initGeo: async function () {
    if (this.state.geoJSON) {
      return this.state.geoJSON;
    }

    try {
      const res = await fetch("data/landkreise.geo.json");
      this.state.geoJSON = await res.json();
      return this.state.geoJSON;
    } catch (e) {
      console.error("Error cargando GeoJSON:", e);
    }
  },

  /**
   * Fetches the filtered data from the server and caches it.
   * filters - Object containing the filter values.
   */
  fetchFilteredData: async function (filters = {}) {
    const params = new URLSearchParams();
    // Add filter values to the URL parameters.
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

    const cacheKey = params.toString();

    if (this.state.requestCache[cacheKey]) {
      return this.state.requestCache[cacheKey];
    }


    const url = `includes/api_opfer.php?${cacheKey}`;

    try {
      const response = await fetch(url);
      const rawData = await response.json();

      // Process the data at the client side.
      // This is necessary so that the map can quickly access the data.
      const index = {};
      rawData.forEach((item) => {
        const name = item.name.toLowerCase().trim();
        const val = parseInt(item.value || 0);
        if (!index[name]) index[name] = 0;
        index[name] += val;
      });

      // Store the data in the cache.
      const resultState = {
        rawData: rawData,
        opferIndex: index,
        geoJSON: this.state.geoJSON,
      };

      this.state.requestCache[cacheKey] = resultState;
      return resultState;
    } catch (err) {
      console.error("Error in fetchFilteredData:", err);
      return null;
    }
  },

  // Spezielle Namenskorrekturen
  nameMapping: {
    "hanover": "region hannover",
    "aschersleben-staßfurt": "aschersleben-stassfurt", // ß -> ss
    "lauenburg": "herzogtum lauenburg",
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
    n = n.replace(/ß/g, "ss"); // ß -> ss

    return n;
  },

  /**
   * Filters the given data based on the selected Landkreise.
   * It returns all items from the data which have a name that matches one of the selected Landkreise.
   */
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
