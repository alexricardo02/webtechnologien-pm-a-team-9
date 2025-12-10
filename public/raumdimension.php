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
</head>

<body>
  <?php include "includes/header.php"; ?>

  <main id="dashboard-container">
    <div class="page-header">
      <h1>Raumdimension</h1>
      <p>Geovisualisierung der Straftaten nach Landkreisen</p>
    </div>
    
    <section class="controls-section dashboard-row" style="margin-bottom: 30px;">
        <div class="dashboard-card filter-card-narrow" style="min-width: 250px; max-width: 300px; flex-grow: 0;">
            <h3>Filter</h3>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label for="filter-jahr">Jahr</label>
                    <select id="filter-jahr" class="styled-select" style="width: 100%;">
                        <option value="">Alle Jahre</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                    </select>
                </div>
                <div>
                    <label for="filter-geschlecht">Geschlecht</label>
                    <select id="filter-geschlecht" class="styled-select" style="width: 100%;">
                        <option value="">Alle Geschlechter</option>
                        <option value="maennlich">Männlich</option>
                        <option value="weiblich">Weiblich</option>
                    </select>
                </div>
                <div>
                    <label for="filter-straftat">Straftat (Hauptkategorie)</label>
                    <select id="filter-straftat" class="styled-select" style="width: 100%;">
                        <?php 
                        foreach ($straftat_hauptkategorien as $label => $value) {
                            echo "<option value=\"" . htmlspecialchars(strtolower($value)) . "\">" . htmlspecialchars($label) . "</option>";
                        }
                        ?>
                    </select>
                </div>
                <button id="apply-filters" class="button-primary" style="margin-top: 10px; padding: 10px;">Filter anwenden</button>
            </div>
        </div>
    </section>

    <div class="dashboard-row">
      <div class="dashboard-card map-card">
        <h3>Deutschlandkarte</h3>
        <?php include "includes/karte.php"; ?>
      </div>

      <div class="dashboard-card chart-card">
        <h3>Top 5 Landkreise (Höchste Opferzahlen)</h3>
        <div class="chart-placeholder">
          <canvas id="opferChart"></canvas>
        </div>
      </div>
    </div>

    <div class="dashboard-row">
      <div class="dashboard-card chart-card">
        <h3>Bottom 5 Landkreise (Niedrigste Opferzahlen)</h3>
        <div class="chart-placeholder">
          <canvas id="chartId"></canvas>
        </div>
      </div>
       <div class="dashboard-card chart-card">
        <h3>Zusätzliche Statistik</h3>
        <div class="chart-placeholder">
          <canvas id="anotherChart"></canvas>
          <p style="text-align: center; color: #888; margin-top: 50px;">
            (Platzhalter)
          </p>
        </div>
      </div>
    </div>
  </main>
</body>
</html>