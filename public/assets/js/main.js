/**
 * Central Data Manager
 * Koordiniert die Datenverarbeitung und die Anwendungsinitialisierung.
 */

document.addEventListener("DOMContentLoaded", () => {

    // Filtern der aktuellen Filterwerte aus den Dropdowns
    const getCurrentFilters = () => {
        return {
            jahr: document.getElementById('filter-jahr')?.value || '',
            geschlecht: document.getElementById('filter-geschlecht')?.value || '',
            straftat: document.getElementById('filter-straftat')?.value || '',
            landkreis: document.getElementById('filter-landkreis')?.value || '',
            altersgruppe: document.getElementById('filter-altersgruppe')?.value || ''
        };
    };


    // Master Funktion: Lädt Daten und rendert Karte + Grafiken
    const loadAndRender = async () => {
        // 1. Aktuelle Filterwerte holen
        const filters = getCurrentFilters();

        // 2. Sicherstellen, dass wir den GeoJSON base haben (nur beim ersten Mal herunterladen)
        await DataManager.initGeo();

        // 3. Filterte Daten an den Server anfragen
        const dataState = await DataManager.fetchFilteredData(filters);

        if (dataState) {
            // 4. Karte aktualisieren (wenn die Funktion existiert)
            if (window.initMap) {
                window.initMap(dataState.geoJSON, dataState.opferIndex);
            }

            // 5. Grafiken aktualisieren (falls die Funktion in raumdimension_chart.js existiert)
            if (window.initDashboardCharts) {
                window.initDashboardCharts(dataState.rawData);
            }
        }
    };


    // --- EVENTS ---

    // 1. Initial Load
    loadAndRender();

    // 2. Button "Filter anwenden"
    const applyBtn = document.getElementById('apply-filters'); // Button muss diese ID haben
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Seitenneuladen vermeiden, wenn Sie sich in einem Formular befinden
            loadAndRender();
        });
    }
});









/*



    // 1. Daten an daten.js nachfragen (daten.js)
    DataManager.loadAllData()
        .then(state => {
            
            // 2. Grafiken initialisieren
            if (window.initDashboardCharts) {
                window.initDashboardCharts(state.rawData);
            }

            // 3. Karte initialisieren
            if (window.initMap) {
                window.initMap(state.geoJSON, state.opferIndex);
            }

        })
        .catch(err => {
            console.error("Error", err);
            alert("Fehler beim Laden der Daten.");
        });
});

*/