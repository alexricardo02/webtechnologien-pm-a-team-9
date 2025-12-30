
/* Ist dafür zuständig, Daten EINMAL zu laden und sie an diejenigen weiterzugeben, die sie anfordern. */

const DataManager = {
    // Hier werden die Daten gespeichert 
    state: {
        geoJSON: null, // Karte GeoJSON
        requestCache: {}
    },

    getLandkreisNames: function() {
        if (!this.state.geoJSON) return [];
        // wir extrahieren alle eindeutigen Landkreisnamen aus dem GeoJSON
        const names = this.state.geoJSON.features.map(f => f.properties.NAME_3);
        return [...new Set(names)].sort();
    },


    initGeo: async function () {
        if (this.state.geoJSON) return this.state.geoJSON;
        try {
            const res = await fetch('data/landkreise.geo.json');
            this.state.geoJSON = await res.json();
            return this.state.geoJSON;
        } catch (e) {
            console.error("Error cargando GeoJSON:", e);
        }
    },
    /**
     * Hauptfunktion: Lädt alles Notwendige.
     * Gibt ein Versprechen zurück, damit die Karte weiß, wann sie beginnen soll.
     */

    fetchFilteredData: async function (filters = {}) {

        const params = new URLSearchParams();
        if (filters.jahr && filters.jahr !== 'all') params.append('jahr', filters.jahr);
        if (filters.geschlecht && filters.geschlecht !== 'all') params.append('geschlecht', filters.geschlecht);
        if (filters.straftat && filters.straftat !== 'all') params.append('straftat', filters.straftat);
        if (filters.landkreis && filters.landkreis !== 'all') params.append('landkreis', filters.landkreis);
        if (filters.altersgruppe && filters.altersgruppe !== 'all') params.append('altersgruppe', filters.altersgruppe);

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
            rawData.forEach(item => {
                const name = item.name.toLowerCase().trim();
                const val = parseInt(item.value || 0);
                if (!index[name]) index[name] = 0;
                index[name] += val;
            });

            const resultState = {
                rawData: rawData,
                opferIndex: index,
                geoJSON: this.state.geoJSON
            };

            this.state.requestCache[cacheKey] = resultState;
            // 4. Alles ausgeben
            return resultState;
            
        } catch (err) {
            console.error("Error in fetchFilteredData:", err);
            return null;
        }
    }

    
};