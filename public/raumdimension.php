<?php
$straftat_hauptkategorien = [
  "Alle Straftaten" => "",
  "Straftaten insgesamt" => "Straftaten insgesamt",
  "Tötung & Körperverletzung" => "Tötung & Körperverletzung",
  "Sexualdelikte" => "Sexualdelikte",
  "Diebstahl" => "Diebstahl",
  "Raub & Erpressung" => "Raub & Erpressung"
];
?>
<!DOCTYPE html>
<html lang="de">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Raumdimension</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.4.2/chroma.min.js"></script>

  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="assets/js/raumdimension_chart.js" defer></script>

  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/header.css">
  <link rel="stylesheet" href="assets/css/karte.css">
  <link rel="stylesheet" href="assets/css/kpi.css">
  <link rel="stylesheet" href="assets/css/filter.css">
  <link rel="stylesheet" href="assets/css/dashboard.css">
  <link rel="stylesheet" href="assets/css/moreThan10LandkWarning.css">
  <script src="assets/js/centralDataManager.js" defer></script>
  <script src="kpi2023.js" defer></script>
  <script src="kpi2024.js" defer></script>
  <script src="assets/js/main.js" defer></script>

</head>

<body>
  <?php include "includes/header.php"; ?>

  <main id="dashboard-container">
    <header class="dashboard-header">
      <h2>Dashboard</h2>
      <p class="subtitle">Kriminalitätsstatistik & Datenanalyse</p>
    </header>
    <section class="controls-section">

      <div class="dashboard-card filter-card">

        <h3 style="margin: 0; padding-right: 20px; border-right: 1px solid #eee;">Filter</h3>

        <div class="filter-row-container">

          <div class="filter-group">
            <label for="filter-jahr">Jahr</label>
            <select id="filter-jahr" class="styled-select">
              <option value="">Alle Jahre</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="filter-geschlecht">Geschlecht</label>
            <select id="filter-geschlecht" class="styled-select">
              <option value="">Alle Geschlechter</option>
              <option value="maennlich">Männlich</option>
              <option value="weiblich">Weiblich</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="filter-straftat">Straftat</label>
            <select id="filter-straftat" class="styled-select">
              <?php
              foreach ($straftat_hauptkategorien as $label => $value) {
                echo "<option value=\"" . htmlspecialchars(strtolower($value)) . "\">" . htmlspecialchars($label) . "</option>";
              }
              ?>
            </select>
          </div>

          <button id="apply-filters" class="button-primary">Anwenden</button>

        </div>
      </div>
    </section>
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

    </section>



    <div class="dashboard-row">
      <div class="dashboard-card map-card">
        <?php include "includes/karte.php"; ?>
      </div>

      <div class="dashboard-card chart-card">
        <div class="chart-placeholder">
          <canvas id="top5chart"></canvas>
        </div>
      </div>
    </div>

    <div class="dashboard-row">
      <div class="dashboard-card chart-card">
        <div class="chart-placeholder">
          <canvas id="bottom5chart"></canvas>
        </div>
      </div>
      <div class="dashboard-card chart-card">
        <div id="limitWarning" class="alert-info-mini" style="display: none;">
          <i class="fas fa-info-circle"></i> Hinweis: Es werden nur die 10 Landkreise mit den höchsten Opferzahlen
          angezeigt.
        </div>
        <div class="chart-placeholder">
          <canvas id="opferNachLandkreisenBis10Chart"></canvas>
        </div>
      </div>
    </div>
  </main>
</body>

</html>