/**
 * Diese Datei verwaltet nur die Elemente des Dashboards:
 * 
 * - Empfängt die gruppierten Datenpakete vom Service.
 * - Sendet die Daten für jedes Diagramm separat und aktualisiert sie.
 * 
 */

document.addEventListener("DOMContentLoaded", () => {
  // Filtern der aktuellen Filterwerte aus dem UI
  const getFiltersFromUI = () => {
    // Landkreise aus dem globalen Set holen
    let selectedLandkreise;
    if (window.selectedLandkreise) {
      selectedLandkreise = Array.from(window.selectedLandkreise);
    } else {
      selectedLandkreise = [];
    }

    let straftatString = "";
    if (window.selectedStraftaten) {
      straftatString = Array.from(window.selectedStraftaten).join(",");
    }

    const cleanLandkreiseNamen = selectedLandkreise.map((name) =>
      DataService.cleanLandkreiseTextForDatabaseMatching(name)
    );

    // HIER FEHLT MEHRFACHAUSWAHL FUNKTIONALITAT VON ALTERSGRUPPEN

    return {
      jahr: document.getElementById("filter-jahr")?.value || "",
      geschlecht: document.getElementById("filter-geschlecht")?.value || "",
      straftat: straftatString,
      altersgruppe: document.getElementById("filter-altersgruppe")?.value || "",
      landkreis: cleanLandkreiseNamen.join(","),
    };
  };

  const mapLandkreisNamenZuGemeindeschluessel = (listeZuAusfuellen, filteredRawData) => {

    filteredRawData.forEach((landkreis) => {
      const name = (landkreis.name || "").toLowerCase().trim();
      listeZuAusfuellen[name] = (listeZuAusfuellen[name] || 0) + parseInt(landkreis.value || 0);
      if (landkreis.id) {
        // Wir wandlen die Datenbank-ID (z.B. 5315) in einen Gemeindeschluessel um (z.B. "05315")
        const gemeindeSchluessel = String(landkreis.id).padStart(5, "0");
        listeZuAusfuellen[gemeindeSchluessel] = (listeZuAusfuellen[gemeindeSchluessel] || 0) + parseInt(landkreis.value || 0);
      }
    });
  }

  // Master Funktion: Lädt Daten von Service und rendert Karte + Grafiken
  const refreshAllDashboardCharts = async () => {
    const selectedLandkreise = window.selectedLandkreise || new Set();
    const filters = getFiltersFromUI();
    await DataService.loadMapGeometryFromJson();

    // Filterparameter für Aufruf erzeugen
    let rankingFilters = {
      jahr: filters.jahr,
      geschlecht: filters.geschlecht,
      straftat: filters.straftat,
      altersgruppe: filters.altersgruppe,
      landkreis: filters.landkreis,
      groupBy: "landkreis",
    };

    let straftatParameters = {
      jahr: filters.jahr,
      geschlecht: filters.geschlecht,
      straftat: filters.straftat,
      altersgruppe: filters.altersgruppe,
      landkreis: filters.landkreis,
      groupBy: "straftat",
    };

    let ageParameters = {
      jahr: filters.jahr,
      geschlecht: filters.geschlecht,
      straftat: filters.straftat,
      altersgruppe: filters.altersgruppe,
      landkreis: filters.landkreis,
      groupBy: "altersgruppe",
    };

    let genderParameters = {
      jahr: filters.jahr,
      geschlecht: filters.geschlecht,
      straftat: filters.straftat,
      altersgruppe: filters.altersgruppe,
      landkreis: filters.landkreis,
      groupBy: "gender",
    };

    try {
      const [
        filteredDataState,
        unfilteredDataState, // Daten für Top5/Bottom5 Rankings
        straftatState,
        ageState,
        genderState,
      ] = await Promise.all([
        DataService.getDataFromDatabase(filters),
        DataService.getDataFromDatabase(rankingFilters), // Aufruf für Top5/Bottom5 Rankings
        DataService.getDataFromDatabase(straftatParameters),
        DataService.getDataFromDatabase(ageParameters),
        DataService.getDataFromDatabase(genderParameters),
      ]);

      if (filteredDataState && unfilteredDataState && straftatState && ageState && genderState) {
        const straftatData = straftatState.rawData;
        const ageData = ageState.rawData;
        const genderData = genderState.rawData;
        const filteredRawData = landkreisSuchFunktion(filteredDataState.rawData, selectedLandkreise); // Daten für Karte & KPIs (reagiert auf ausgewählten Landkreis)

        // Map von Landkreisnamen zu Gemeindeschluessel  (listeZuAusfuellen, filteredRawData)
        const indexVonLandkreisnamenUndOpferzahlen = {};
        mapLandkreisNamenZuGemeindeschluessel(indexVonLandkreisnamenUndOpferzahlen, filteredRawData);

        // 2. Daten für Top/Bottom Rankings
        // Hier schicken wir die Daten OHNE den Landkreis-Filter hinein
        window.initRankingCharts(unfilteredDataState.rawData, filteredRawData);
        // 3. Update Karte und KPIs mit gefilterten Daten
        window.updateKPI2023(filteredRawData);
        window.updateKPI2024(filteredRawData);
        window.initMap(filteredDataState.geoJSON, indexVonLandkreisnamenUndOpferzahlen);
        // 4. Update der restlichen Charts
        window.initAgeChart(ageData);
        window.initCrimeComparisonChart(straftatData);
        window.renderGenderChart(genderData);
        window.initCrimeStackedChart(straftatData);
      }
    } catch (error) {
      console.error("Fehler beim parallel Laden der Daten:", error);
    }
  };

  // --- EVENTS ---

  // Anwenden-Button
  const applyBtn = document.getElementById("apply-filters");
  if (applyBtn) {
    applyBtn.addEventListener("click", (e) => {
      refreshAllDashboardCharts();
    });
  }

  // Reset-Button
  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {

      // Aktualisierung der Dropdowns
      const dropdowns = [
        "filter-jahr",
        "filter-geschlecht",
        "filter-altersgruppe",
      ];
      dropdowns.forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.value = "all";
      });

      const straftatElement = document.getElementById("filter-straftat");
      if (straftatElement) straftatElement.value = "";

      if (window.selectedLandkreise) window.selectedLandkreise.clear();
      if (window.selectedStraftaten) window.selectedStraftaten.clear();
      if (typeof renderTags === "function") renderTags();
      if (typeof renderStraftatTags === "function") renderStraftatTags();

      refreshAllDashboardCharts();
    });
  }

  window.refreshDashboard = () => refreshAllDashboardCharts();
  window.refreshDashboard();
});
