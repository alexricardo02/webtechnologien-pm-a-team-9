

document.addEventListener("DOMContentLoaded", () => {

    // 1. Helper: Get current values from all dropdowns
    const getCurrentFilters = () => {
        return {
            jahr: document.getElementById('filter-jahr')?.value || '',
            geschlecht: document.getElementById('filter-geschlecht')?.value || '',
            straftat: document.getElementById('filter-straftat')?.value || '',
            landkreis: document.getElementById('filter-landkreis')?.value || '',
            // 'altersgruppe' is usually not a filter dropdown, but we keep it just in case
            altersgruppe: document.getElementById('filter-altersgruppe')?.value || ''
        };
    };

    // 2. Master Function: Load Data & Render All Charts
    const loadAndRender = async () => {
        const filters = getCurrentFilters();
        
        // Initialize GeoJSON (Map Boundaries) if not ready
        if (DataManager.initGeo) await DataManager.initGeo();

        // --- A. Load Standard Data (Map & Top/Bottom Lists) ---
        const dataState = await DataManager.fetchFilteredData(filters);

        // --- B. Load Comparison Data (Straftat Grouping) ---
        let straftatData = [];
        try {
            const straftatParams = new URLSearchParams(filters);
            straftatParams.append('groupBy', 'straftat');
            const straftatRes = await fetch(`includes/api_opfer.php?${straftatParams.toString()}`);
            straftatData = await straftatRes.json();
        } catch (e) {
            console.error("Error loading Crime Comparison data:", e);
        }

        // --- C. Load Age Data (SCRUM-209) ---
        let ageData = [];
        try {
            const ageParams = new URLSearchParams(filters);
            ageParams.append('groupBy', 'altersgruppe'); // Must match API
            const ageRes = await fetch(`includes/api_opfer.php?${ageParams.toString()}`);
            ageData = await ageRes.json();
            // console.log("Age Data Loaded:", ageData); // Debugging
        } catch (e) {
            console.error("Error loading Age data:", e);
        }

        // --- D. Render Everything ---
        if (dataState) {
            // 1. Map
            if (window.initMap) {
                window.initMap(dataState.geoJSON, dataState.opferIndex);
            }
            // 2. Dashboard Charts (Top 5 / Bottom 5)
            if (window.initDashboardCharts) {
                window.initDashboardCharts(dataState.rawData);
            }
            // 3. Crime Comparison (Bar Chart)
            if (window.initCrimeComparisonChart) {
                window.initCrimeComparisonChart(straftatData);
            }
            // 4. Crime Stacked (2023 vs 2024)
            if (window.initCrimeStackedChart) {
                window.initCrimeStackedChart(filters);
            }
            // 5. SCRUM-209: Age Distribution Chart
            if (window.initAgeChart) {
                window.initAgeChart(ageData);
            }
        }
    };

    // --- EVENTS ---

    // 1. Initial Load on Page Start
    loadAndRender();

    // 2. "Filter Anwenden" Button Click
    const applyBtn = document.getElementById('apply-filters');
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent page reload
            loadAndRender();
        });
    }
});