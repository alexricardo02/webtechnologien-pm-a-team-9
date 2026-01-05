<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Überblick</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/header.css">
  </head>
  <body>
    <?php include "includes/header.php"; ?>

    <main style="padding-top: 100px;">
      <h1>Datenverwaltung</h1>
    </main>

    <div class="container-fluid mt-4">
    <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
            <h2><i class="fas fa-database me-2"></i>Datenverwaltung & Export</h2>
            
            <div class="export-controls d-flex gap-2 align-items-center bg-light p-3 border rounded">
                <label for="export-format" class="fw-bold mb-0">Format:</label>
                <select id="export-format" class="form-select form-select-sm" style="width: auto;">
                    <option value="csv">CSV (.csv)</option>
                    <option value="json">JSON (.json)</option>
                </select>
                <button id="btn-export" class="btn btn-primary btn-sm">
                    <i class="fas fa-download me-1"></i> Exportieren
                </button>
            </div>
        </div>
    </div>

    <div class="card shadow-sm">
        <div class="card-header bg-white py-3">
            <h5 class="card-title mb-0">Rohdaten (Opfer-Statistik)</h5>
        </div>
        <div class="card-body p-0">
            <div id="table-wrapper" style="height: 600px; overflow-y: auto; overflow-x: auto;">
                <table class="table table-hover table-striped mb-0" id="raw-data-table">
                    <thead class="table-dark sticky-top">
                        <tr>
                            <th>AGS (ID)</th>
                            <th>Stadt / Landkreis</th>
                            <th>Jahr</th>
                            <th>Geschlecht</th>
                            <th>Straftat</th>
                            <th>Altersgruppe</th>
                            <th>Wert (Opfer)</th>
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        <tr>
                            <td colspan="7" class="text-center py-5">
                                <div class="spinner-border text-primary" role="status"></div>
                                <p class="mt-2">Lade Daten...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="card-footer bg-white text-muted">
            Total de registros cargados: <span id="record-count">0</span>
        </div>
    </div>
</div>
  </body>
</html>
