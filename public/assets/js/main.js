/**
 * Koordiniert die Datenverarbeitung und die Anwendungsinitialisierung.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Filtern der aktuellen Filterwerte aus den Dropdowns
  const getFiltersFromUI = () => {
    // Landkreise aus dem globalen Set holen
    let selectedLandkreise;

    if (window.selectedLandkreise) {
        selectedLandkreise = Array.from(window.selectedLandkreise);
    } else {
        selectedLandkreise = [];
    }

    const cleanLandkreise = selectedLandkreise.map((name) =>
      DataManager.cleanTextForDatabaseMatching(name)
    );

    // Straftaten aus dem globalen Set holen
    const straftatSelect = document.getElementById("filter-straftat");
    let selectedCrimes = "";
    if (straftatSelect) {
      selectedCrimes = Array.from(straftatSelect.selectedOptions)
        .map((option) => option.value).filter((value) => value !== "") // "Alle" ignorieren
        .join(",");
    }


    // HIER FEHLT MEHRFACHAUSWAHL FUNKTIONALITAT VON ALTERSGRUPPEN

    return {
      jahr: document.getElementById("filter-jahr")?.value || "",
      geschlecht: document.getElementById("filter-geschlecht")?.value || "",
      straftat: selectedCrimes,
      altersgruppe: document.getElementById("filter-altersgruppe")?.value || "",
      landkreis: cleanLandkreise.join(","),
    };
  };

  // Master Funktion: Lädt Daten und rendert Karte + Grafiken
  const refreshAllDashboardCharts = async () => {
    const selectedLandkreise = window.selectedLandkreise || new Set();
    const filters = getFiltersFromUI();
    await DataManager.initGeo();

    let rankingFilters = {};
    rankingFilters.jahr = filters.jahr;
    rankingFilters.geschlecht = filters.geschlecht;
    rankingFilters.straftat = filters.straftat;
    rankingFilters.altersgruppe = filters.altersgruppe;
    rankingFilters.landkreis = "";

    const straftatParams = new URLSearchParams(filters);
    straftatParams.append("groupBy", "straftat");

    const ageParams = new URLSearchParams(filters);
    ageParams.append("groupBy", "altersgruppe");

    const genderParams = new URLSearchParams(filters);
    genderParams.append("groupBy", "gender");

    const stackedParams = new URLSearchParams(filters);
    stackedParams.delete("jahr");
    stackedParams.append("groupBy", "straftat");

    try {
      // Laden zusätzlich den globalen Datensatz für die Top/Bottom Rankings
      const [
        filteredDataState,
        unfilteredDataState,
        straftatResponse,
        ageResponse,
        genderResponse,
        stackedResponse,
      ] = await Promise.all([
        DataManager.getDataFromDatabase(filters), // Gefiltert für Karte/KPIs
        DataManager.getDataFromDatabase(rankingFilters),
        fetch(`includes/api_opfer.php?${straftatParams.toString()}`),
        fetch(`includes/api_opfer.php?${ageParams.toString()}`),
        fetch(`includes/api_opfer.php?${genderParams.toString()}`),
        fetch(`includes/api_opfer.php?${stackedParams.toString()}`),
      ]);

      const [straftatData, ageData, genderData, stackedData] =
        await Promise.all([
          straftatResponse.json(),
          ageResponse.json(),
          genderResponse.json(),
          stackedResponse.json(),
        ]);

      if (filteredDataState && unfilteredDataState) {

        // 1. Daten für Karte & KPIs (reagiert auf ausgewählten Landkreis)
        const filteredRawData = DataManager.landkreisSuchFunktion(
          filteredDataState.rawData,
          selectedLandkreise
        );

        // Map von Landkreisnamen zu AGS-Codes
        const filteredIndex = {};
        filteredRawData.forEach((item) => {
          const name = (item.name || "").toLowerCase().trim();
          filteredIndex[name] = (filteredIndex[name] || 0) + parseInt(item.value || 0);
        });

        filteredRawData.forEach((item) => {
          if (item.id) {
            // Wir wandlen die DB-ID (z.B. 5315) in einen AGS-Code um (z.B. "05315")
            const ags = String(item.id).padStart(5, "0");
            filteredIndex[ags] = (filteredIndex[ags] || 0) + parseInt(item.value || 0);
          }
        });

        // 2. Daten für Top/Bottom Rankings
        // Hier schicken wir die Daten OHNE den Landkreis-Filter hinein
        if (window.initDashboardCharts) window.initDashboardCharts(unfilteredDataState.rawData, filteredRawData);
        
        // 3. Update Karte und KPIs mit gefilterten Daten
        if (window.updateKPI2023) window.updateKPI2023(filteredRawData);
        if (window.updateKPI2024) window.updateKPI2024(filteredRawData);
        if (window.initMap) window.initMap(filteredDataState.geoJSON, filteredIndex);

        // 4. Update der restlichen Charts
        if (window.initAgeChart) window.initAgeChart(ageData);
        if (window.initCrimeComparisonChart)
          window.initCrimeComparisonChart(straftatData);
        if (window.renderGenderChart) window.renderGenderChart(genderData);
        if (window.initCrimeStackedChart)
          window.initCrimeStackedChart(stackedData);
      }
    } catch (error) {
      console.error("Fehler beim parallel Laden der Daten:", error);
    }
  };

  // --- EVENTS ---

  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const dropdowns = [
        "filter-jahr",
        "filter-geschlecht",
        "filter-straftat",
        "filter-altersgruppe",
      ];
      dropdowns.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "all";
      });

      const straftatEl = document.getElementById("filter-straftat");
      if (straftatEl) straftatEl.value = "";

      if (window.selectedLandkreise) window.selectedLandkreise.clear();
      if (typeof renderTags === "function") renderTags();

      refreshAllDashboardCharts();
    });
  }

  window.refreshDashboard = () => refreshAllDashboardCharts();
  window.refreshDashboard();

  const applyBtn = document.getElementById("apply-filters");
  if (applyBtn) {
    applyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      refreshAllDashboardCharts();
    });
  }
});
