<?php
$straftat_hauptkategorien = [
  "Alle Straftaten" => "",
  "Insgesamt" => "Insgesamt",
  "Tötung & Körperverletzung" => "Tötung & Körperverletzung",
  "Sexualdelikte" => "Sexualdelikte",
  "Raubdelikte" => "Raubdelikte",
  "Widerstand & Angriff" => "Widerstand & Angriff"
];
?>
<!DOCTYPE html>
<html lang="de">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dashboard</title>

  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.4.2/chroma.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

  <script src="assets/js/raumdimension_chart.js" defer></script>
  <script src="assets/js/gender_chart.js" defer></script>
  <script src="assets/js/crime_comparison_chart.js" defer></script>
  <link rel="stylesheet" href="assets/css/style.css">
  <script src="assets/js/crime_stacked_chart.js" defer></script>
  <link rel="stylesheet" href="assets/css/header.css">
  <link rel="stylesheet" href="assets/css/karte.css">
  <link rel="stylesheet" href="assets/css/kpi.css">
  <link rel="stylesheet" href="assets/css/filter.css">
  <link rel="stylesheet" href="assets/css/dashboard.css">
  <link rel="stylesheet" href="assets/css/moreThan10LandkWarning.css">

  <script src="assets/js/centralDataManager.js" defer></script>
  <script src="assets/js/kpi2023.js" defer></script>
  <script src="assets/js/kpi2024.js" defer></script>
  <script src="assets/js/main.js" defer></script>
  <script src="assets/js/age_chart.js" defer></script>
</head>

<body>
  <?php include "includes/header.php"; ?>

  <div class="dashboard-layout">
    <aside class="sidebar-filters">
      <header class="dashboard-header">
        <h2>Dashboard</h2>
        <p class="subtitle">Kriminalitätsstatistik & Datenanalyse</p>
      </header>
      <div class="sidebar-header">
        <h3>Filter</h3>
      </div>

      <div class="filter-vertical-container">
        <div class="filter-group-vertical">
          <label for="filter-jahr">Jahr</label>
          <select id="filter-jahr" class="styled-select">
            <option value="">Alle Jahre</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>
        </div>

        <div class="filter-group-vertical">
          <label for="filter-geschlecht">Geschlecht</label>
          <select id="filter-geschlecht" class="styled-select">
            <option value="">Alle Geschlechter</option>
            <option value="maennlich">Männlich</option>
            <option value="weiblich">Weiblich</option>
          </select>
        </div>

        <div class="filter-group-vertical">
          <label for="filter-straftat">Straftat</label>
          <select id="filter-straftat" class="styled-select">
            <?php
            foreach ($straftat_hauptkategorien as $label => $value) {
              echo "<option value=\"" . htmlspecialchars($value) . "\">" . htmlspecialchars($label) . "</option>";
            }
            ?>
          </select>
        </div>

        <button id="apply-filters" class="button-primary-block">Anwenden</button>
      </div>
    </aside>

    <main id="dashboard-container">


      <section class="kpi-grid">
        <div class="kpi-card kpi-2023">
          <div class="card-header">
            <span class="year-badge">2023</span>
            <h3>Gesamtopfer</h3>
          </div>
          <div class="card-body">
            <div class="kpi-number" id="val-2023">Lädt...</div>
            <div class="kpi-trend neutral">Basisjahr</div>
          </div>
        </div>
        <div class="kpi-card kpi-2024">
          <div class="card-header">
            <span class="year-badge badge-highlight">2024</span>
            <h3>Gesamtopfer</h3>
          </div>
          <div class="card-body">
            <div class="kpi-number" id="val-2024">Lädt...</div>
            <div class="kpi-trend">Aktuelle Daten</div>
          </div>
        </div>

        <div class="kpi-card kpi-danger">
          <div class="card-header">
            <span class="year-badge danger-badge">Gefährlichste</span>
            <h3>Meiste Opfer</h3>
          </div>
          <div class="card-body">
            <div class="kpi-number" id="top-district-name">Berlin</div>
            <div class="kpi-trend" id="top-district-value">-</div>
          </div>
        </div>
      </section>

      <div class="dashboard-row" style="display: flex; gap: 20px; margin-bottom: 20px;">
        <div class="dashboard-card map-card" style="flex: 1; min-width: 0;">
          <?php include "includes/karte.php"; ?>
        </div>

        <div class="dashboard-card chart-card" style="flex: 1; min-width: 0;">
          <div class="chart-placeholder" style="height: 350px; position: relative;">
            <canvas id="genderChart"></canvas>
          </div>
        </div>
      </div>

      <div class="dashboard-row" style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
        <div class="dashboard-card chart-card" style="flex: 1; min-width: 450px;">
          <div style="height: 350px; position: relative;">
            <canvas id="crimeComparisonChart"></canvas>
          </div>
        </div>

        <div class="dashboard-card chart-card" style="flex: 1; min-width: 450px;">
          <div style="height: 350px; position: relative;">
            <canvas id="crimeStackedChart"></canvas>
          </div>
        </div>
      </div>

      <div class="dashboard-row" style="display: flex; gap: 20px; margin-bottom: 20px;">
        <div class="dashboard-card chart-card" style="flex: 1; min-width: 0;">
          <div class="chart-placeholder">
            <canvas id="top5chart"></canvas>
          </div>
        </div>

        <div class="dashboard-card chart-card" style="flex: 1; min-width: 0;">
          <div class="chart-placeholder" style="height: 350px; position: relative;">
            <canvas id="bottom5chart"></canvas>
          </div>
        </div>
      </div>

      <div class="dashboard-row">
        <div class="dashboard-card chart-card" style="width: 100%; flex: 1;">
          <div id="limitWarning" class="alert-info-mini" style="display: none;">
            <i class="fas fa-info-circle"></i> Hinweis: Es werden nur die 10 Landkreise mit den höchsten Opferzahlen
            angezeigt.
          </div>
          <div class="chart-placeholder">
            <canvas id="opferNachLandkreisenBis10Chart"></canvas>
          </div>
        </div>
      </div>

      <div class="dashboard-row">
        <div class="dashboard-card chart-card" style="width: 100%; flex: 1;">
          <div class="chart-placeholder" style="height: 400px; position: relative;">
            <canvas id="ageChart"></canvas>
          </div>
        </div>
      </div>

    </main>


  </div>


</body>

</html>