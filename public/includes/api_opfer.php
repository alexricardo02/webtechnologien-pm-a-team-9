<?php
header('Content-Type: application/json; charset=utf-8');

include 'db.inc.php';

if (!$verbindung) {
    echo json_encode(["error" => "Database Connection Failed"]);
    exit();
}

// 2. Filter von Frontend abholen
$jahr = isset($_GET['jahr']) ? $_GET['jahr'] : '';
$geschlecht = isset($_GET['geschlecht']) ? $_GET['geschlecht'] : '';
$straftat = isset($_GET['straftat']) ? $_GET['straftat'] : '';
$landkreis = isset($_GET['landkreis']) ? $_GET['landkreis'] : '';
$altersgruppe = isset($_GET['altersgruppe']) ? $_GET['altersgruppe'] : '';



// 3. SQL Abfrage mit Filtern bauen
$sql = "SELECT Stadt_Landkreis, Jahr, SUM(Wert) as total_wert FROM Opfer_Data WHERE 1=1";
$params = [];
$types = "";

if ($jahr && $jahr !== 'all') {
    $sql .= " AND Jahr = ?";
    $types .= "i";
    $params[] = $jahr;
}
if ($geschlecht && $geschlecht !== 'all') {
    $sql .= " AND Geschlecht = ?";
    $types .= "s";
    $params[] = $geschlecht;
}
if ($straftat && $straftat !== 'all') {
    $sql .= " AND Straftat_Hauptkategorie = ?";
    $types .= "s";
    $params[] = $straftat;
}
if ($landkreis && $landkreis !== 'all') {
    $sql .= " AND Stadt_Landkreis = ?";
    $types .= "s";
    $params[] = $landkreis;
}
if ($altersgruppe && $altersgruppe !== 'all') {
    $sql .= " AND Altersgruppe = ?";
    $types .= "s";
    $params[] = $altersgruppe;
}

// --- Gruppierung
// Durch Landkreis und Jahr gruppieren. MySQL summiert die Werte automatisch.
$sql .= " GROUP BY Stadt_Landkreis, Jahr";


// 4. Vorbereiten und Ausführen
$stmt = $verbindung->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

// 5. Daten formattieren, damit JS sie versteht
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'name' => $row['Stadt_Landkreis'], // JS braucht das um 
        'year' => (int)$row['Jahr'],       // JS braucht das für KPIs
        'value' => (int)$row['total_wert'] // JS braucht das für Summe
    ];
}
// 6. JSON schicken
echo json_encode($data);

$stmt->close();
$verbindung->close();