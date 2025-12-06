<!DOCTYPE html>
<html lang="de">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Überblick | Dashboard</title>

    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/header.css">
    <link rel="stylesheet" href="assets/css/kpi.css">

    <script src="kpi2023.js" defer></script>
    <script src="kpi2024.js" defer></script>
</head>

<body>
    <?php include "includes/header.php"; ?>

    <main class="dashboard-wrapper">

        <header class="dashboard-header">
            <h2>Dashboard Überblick</h2>
            <p class="subtitle">Kriminalitätsstatistik & Datenanalyse</p>
        </header>

        <section class="controls-section">
            <div class="filter-card">
                <label for="state-selector" class="filter-label">Region auswählen</label>
                <div class="select-wrapper">
                    <select id="state-selector" class="styled-select">
                        <option value="Bundesrepublik Deutschland">Gesamt (Deutschland)</option>
                    </select>
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
    </main>

</body>

</html>
