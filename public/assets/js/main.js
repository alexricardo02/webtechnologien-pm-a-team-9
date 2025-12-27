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
        const filters = getCurrentFilters();
        await DataManager.initGeo();

        // Daten für Karte und Top/Bottom-Listen (reagiert auf den Jahres-Filter)
        const dataState = await DataManager.fetchFilteredData(filters);

        // Daten speziell gruppiert nach Straftat (für den einfachen Vergleichschart)
        const straftatParams = new URLSearchParams(filters);
        straftatParams.append('groupBy', 'straftat');
        const straftatRes = await fetch(`includes/api_opfer.php?${straftatParams.toString()}`);
        const straftatData = await straftatRes.json();

        const ageParams = new URLSearchParams(filters);
        ageParams.append('groupBy', 'altersgruppe'); // Important for age chart
        const ageRes = await fetch(`includes/api_opfer.php?${ageParams.toString()}`);
        const ageData = await ageRes.json();

        if (dataState) {
            // Karte und Standard-Charts
            if (window.initMap) window.initMap(dataState.geoJSON, dataState.opferIndex);
            if (window.initDashboardCharts) window.initDashboardCharts(dataState.rawData);

            // Der Altersverteilungs-Chart
            if (window.initAgeChart) {
                window.initAgeChart(ageData);
            }
    
            // Der einfache Vergleichschart (reagiert auf den Jahres-Filter)
            if (window.initCrimeComparisonChart) {
                window.initCrimeComparisonChart(straftatData);
            }

            // Der Stacked Chart (ignoriert das gewählte Jahr intern, um immer 2023/24 zu zeigen)
            if (window.initCrimeStackedChart) {
                window.initCrimeStackedChart(filters);
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