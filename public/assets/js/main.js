/**
 * Central Data Manager
 * Koordiniert die Datenverarbeitung und die Anwendungsinitialisierung.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Filtern der aktuellen Filterwerte aus den Dropdowns
  const getCurrentFilters = () => {
    const selectedLandkreise = window.selectedLandkreise
      ? Array.from(window.selectedLandkreise)
      : [];

    const cleanLandkreise = selectedLandkreise.map((name) =>
      DataManager.normalizeName(name)
    );

    return {
      jahr: document.getElementById("filter-jahr")?.value || "",
      geschlecht: document.getElementById("filter-geschlecht")?.value || "",
      straftat: document.getElementById("filter-straftat")?.value || "",
      landkreis: cleanLandkreise.join(","),
      altersgruppe: document.getElementById("filter-altersgruppe")?.value || "",
    };
  };

  // Master Funktion: Lädt Daten und rendert Karte + Grafiken
  const loadAndRender = async () => {
    const selectedLandkreise = window.selectedLandkreise || new Set();
    const filters = getCurrentFilters();
    await DataManager.initGeo();

    // Daten speziell gruppiert nach Straftat (für den einfachen Vergleichschart)
    const straftatParams = new URLSearchParams(filters);
    straftatParams.append("groupBy", "straftat");

    const ageParams = new URLSearchParams(filters);
    ageParams.append("groupBy", "altersgruppe"); // Important for age chart

    const genderParams = new URLSearchParams(filters);
    genderParams.append("groupBy", "gender");

    // wir löschen den Jahres-Filter für den Stacked Chart, um immer 2023 vs 2024 zu zeigen
    const stackedParams = new URLSearchParams(filters);
    stackedParams.delete("jahr");
    stackedParams.append("groupBy", "straftat");

    try {
      const [dataState, straftatRes, ageRes, genderRes, stackedRes] =
        await Promise.all([
          DataManager.fetchFilteredData(filters),
          fetch(`includes/api_opfer.php?${straftatParams.toString()}`),
          fetch(`includes/api_opfer.php?${ageParams.toString()}`),
          fetch(`includes/api_opfer.php?${genderParams.toString()}`),
          fetch(`includes/api_opfer.php?${stackedParams.toString()}`),
        ]);
      // in JSON gleich umwandeln
      const [straftatData, ageData, genderData, stackedData] =
        await Promise.all([
          straftatRes.json(),
          ageRes.json(),
          genderRes.json(),
          stackedRes.json(),
        ]);

      if (dataState) {
        const fRawData = DataManager.landkreisSuchFunktion(
          dataState.rawData,
          selectedLandkreise
        );
        const fIndex = {};
        fRawData.forEach((item) => {
          const name = (item.name || "").toLowerCase().trim();
          fIndex[name] = (fIndex[name] || 0) + parseInt(item.value || 0);
        });


        if (window.updateKPI2023) window.updateKPI2023(fRawData);
        if (window.updateKPI2024) window.updateKPI2024(fRawData);

        // Karte und Standard-Charts
        if (window.initMap) window.initMap(dataState.geoJSON, fIndex);

        if (window.initDashboardCharts) window.initDashboardCharts(fRawData);

        // Der Altersverteilungs-Chart
        if (window.initAgeChart) {
          window.initAgeChart(ageData);
        }

        // Der einfache Vergleichschart (reagiert auf den Jahres-Filter)
        if (window.initCrimeComparisonChart) {
          window.initCrimeComparisonChart(straftatData);
        }

        if (window.renderGenderChart) window.renderGenderChart(genderData);

        // Der Stacked Chart (ignoriert das gewählte Jahr intern, um immer 2023/24 zu zeigen)
        if (window.initCrimeStackedChart) {
          window.initCrimeStackedChart(stackedData);
        }
      }
    } catch (error) {
      console.error("Fehler beim parallel Laden der Daten:", error);
    }
  };

  // --- EVENTS ---

  // 1. Initial Load
  window.refreshDashboard = () => loadAndRender();
  window.refreshDashboard();
  // 2. Button "Filter anwenden"
  const applyBtn = document.getElementById("apply-filters"); // Button muss diese ID haben
  if (applyBtn) {
    applyBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Seitenneuladen vermeiden, wenn Sie sich in einem Formular befinden
      loadAndRender();
    });
  }
});
