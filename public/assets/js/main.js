/* Verwaltet die Kommunikation zwischen:
- den ausgewählten Filtern 
- dem Abruf von Daten vom Server
- der Aktualisierung aller visuellen Komponenten
*/


document.addEventListener("DOMContentLoaded", () => {
  // -- ALLE FILTERWERT-ERFASSUNG --
  // Alle Auswahlen des Benutzers in Echtzeit erfassen (aktuelle Filterwerte)
  const getCurrentFilters = () => {
    const selectedLandkreise = window.selectedLandkreise
      ? Array.from(window.selectedLandkreise)
      : [];

    // Wir bereinigen die Namen (Kleinbuchstaben, Trim)
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

  // -- DATEN LADEN & RENDERN FUNKTION --
  // Master Funktion: Lädt Daten und rendert Karte + Grafiken. Asynchrones Muster/Await
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

        // KPIs aktualisieren
        if (window.updateKPI2023) window.updateKPI2023(fRawData);
        if (window.updateKPI2024) window.updateKPI2024(fRawData);

        // Karte aktualisieren
        if (window.initMap) window.initMap(dataState.geoJSON, fIndex);

        // Alle Diagramme aktualisieren
        if (window.initDashboardCharts) window.initDashboardCharts(fRawData);

        // Altersverteilungs-Chart aktualisieren (reagiert auf den Altersgruppen-Filter)
        if (window.initAgeChart) window.initAgeChart(ageData);

        // Einfache Vergleichschart aktualisieren (reagiert auf den Jahres-Filter)
        if (window.initCrimeComparisonChart) window.initCrimeComparisonChart(straftatData);

        // Geschlechtsverteilungs-Chart aktualisieren
        if (window.renderGenderChart) window.renderGenderChart(genderData);

        // Stacked Chart aktualisieren (ignoriert das gewählte Jahr intern, um immer 2023/24 zu zeigen)
        if (window.initCrimeStackedChart) window.initCrimeStackedChart(stackedData);
      }
    } catch (error) {
      console.error("Fehler beim parallel Laden der Daten:", error);
    }
  };

  // --- EVENTS ---

  // Aktive Filter Löschen
  const resetBtn = document.getElementById("reset-filters");

  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
        e.preventDefault();

        // 1. Alle Dropdowns zurücksetzen
        const dropdowns = ["filter-jahr", "filter-geschlecht", "filter-straftat", "filter-altersgruppe"];
        dropdowns.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = ""; 
        });

        // 2. Landkreise Auswahl zurücksetzen
        if (window.selectedLandkreise) {
            window.selectedLandkreise.clear();
        }

        if (typeof renderTags === "function") {
            renderTags();
        }

        // 3. Alles neuladen und rendern
        loadAndRender();
    });
}

  // Startladung
  window.refreshDashboard = () => loadAndRender();
  window.refreshDashboard();

  // Button "Filter anwenden"
  const applyBtn = document.getElementById("apply-filters");
  if (applyBtn) {
    applyBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Seitenneuladen vermeiden, wenn man sich in einem Formular befinden
      loadAndRender();
    });
  }
});
