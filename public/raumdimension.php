<!DOCTYPE html>
<html lang="de">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Überblick</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.4.2/chroma.min.js"></script>
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/header.css">
  <link rel="stylesheet" href="assets/css/karte.css">
  <link rel="stylesheet" href="assets/css/dashboard.css">
</head>

<body>
  <?php include "includes/header.php"; ?>

  <main id="dashboard-container">
    <div class="page-header">
      <h1>Raumdimension</h1>
      <p>Geovisualisierung der Straftaten nach Landkreisen</p>
    </div>
    <div class="dashboard-row">
      <div class="dashboard-card map-card">
        <h3>Deutschlandkarte</h3>
        <?php include "includes/karte.php"; ?>
      </div>

      <div class="dashboard-card chart-card">
        <h3>Opfer nach Landkreis</h3>
        <div class="chart-placeholder">
          <canvas id="opferChart"></canvas>
          <p style="text-align: center; color: #888; margin-top: 50px;">
            (Hier kommt die Grafik)
          </p>
        </div>
      </div>
    </div>

    <div class="dashboard-row">
      <div class="dashboard-card chart-card">
        <h3>Grafik Titel</h3>
        <div class="chart-placeholder">
          <canvas id="chartId"></canvas>
          <p style="text-align: center; color: #888; margin-top: 50px;">
            (Hier kommt die Grafik)
          </p>
        </div>
      </div>

    </div>

  </main>


</body>

</html>