/**
 * Central Data Manager
 * Koordiniert die Datenverarbeitung und die Anwendungsinitialisierung.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Filtern der aktuellen Filterwerte aus den Dropdowns
  const getFiltersFromUI = () => {
    // Landkreise aus dem globalen Set holen
    const selectedLandkreise = window.selectedLandkreise
      ? Array.from(window.selectedLandkreise)
      : [];

    const cleanLandkreise = selectedLandkreise.map((name) =>
      DataManager.cleanTextForDatabaseMatching(name)
    );

    // NEU: Mehrfachauswahl für Straftaten auslesen
    const straftatSelect = document.getElementById("filter-straftat");
    let selectedCrimes = "";
    if (straftatSelect) {
      selectedCrimes = Array.from(straftatSelect.selectedOptions)
        .map((opt) => opt.value)
        .filter((val) => val !== "") // "Alle" ignorieren
        .join(",");
    }

    return {
      jahr: document.getElementById("filter-jahr")?.value || "",
      geschlecht: document.getElementById("filter-geschlecht")?.value || "",
      straftat: selectedCrimes, // Jetzt als kommagetrennte Liste
      altersgruppe: document.getElementById("filter-altersgruppe")?.value || "",
      landkreis: cleanLandkreise.join(","),
    };
  };

  // Master Funktion: Lädt Daten und rendert Karte + Grafiken
  const refreshAllDashboardCharts = async () => {
    const selectedLandkreise = window.selectedLandkreise || new Set();
    const filters = getFiltersFromUI();
    await DataManager.loadMapGeometryFromJson();

    const rankingFilters = { ...filters, landkreis: "" };

    const straftatParams = new URLSearchParams(filters);
    straftatParams.append("groupBy", "straftat");

    const ageParams = new URLSearchParams(filters);
    ageParams.append("groupBy", "altersgruppe");

    const genderParams = new URLSearchParams(filters);
    genderParams.append("groupBy", "gender");

    // Jahres-Filter für Stacked Chart entfernen (2023 vs 2024 Vergleich)
    const stackedParams = new URLSearchParams(filters);
    stackedParams.delete("jahr");
    stackedParams.append("groupBy", "straftat");

    try {
      // Laden zusätzlich den globalen Datensatz für die Top/Bottom Rankings
      const [
        dataState,
        globalState,
        straftatRes,
        ageRes,
        genderRes,
        stackedRes,
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
          straftatRes.json(),
          ageRes.json(),
          genderRes.json(),
          stackedRes.json(),
        ]);

      if (dataState && globalState) {
        // 1. Daten für Karte & KPIs (reagiert auf ausgewählten Landkreis)
        const fRawData = DataManager.landkreisSuchFunktion(
          dataState.rawData,
          selectedLandkreise
        );

        if (window.initDashboardCharts) {
          window.initDashboardCharts(globalState.rawData, fRawData);
        }

        const fIndex = {};
        fRawData.forEach((item) => {
          const name = (item.name || "").toLowerCase().trim();
          fIndex[name] = (fIndex[name] || 0) + parseInt(item.value || 0);
        });

        fRawData.forEach((item) => {
          if (item.id) {
            // Wir wandlen die DB-ID (z.B. 5315) in einen AGS-Code um (z.B. "05315")
            const ags = String(item.id).padStart(5, "0");
            fIndex[ags] = (fIndex[ags] || 0) + parseInt(item.value || 0);
          }
        });

        // 2. Daten für Top/Bottom Rankings (Nutzt globalState.rawData -> Bild 2 Effekt)

        // 3. Update Karte und KPIs mit gefilterten Daten
        if (window.updateKPI2023) window.updateKPI2023(fRawData);
        if (window.updateKPI2024) window.updateKPI2024(fRawData);
        if (window.initMap) window.initMap(dataState.geoJSON, fIndex);

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
        if (el) el.value = "";
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
