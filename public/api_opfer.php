<?php
header('Content-Type: application/json; charset=utf-8');

include 'db.inc.php';

if (!$verbindung) {
    echo json_encode(["error" => "Database Connection Failed"]);
    exit();
}

// Filter variables
$jahr = isset($_GET['jahr']) ? $_GET['jahr'] : '';
$geschlecht = isset($_GET['geschlecht']) ? $_GET['geschlecht'] : '';
$straftat = isset($_GET['straftat']) ? $_GET['straftat'] : '';
$landkreis = isset($_GET['landkreis']) ? $_GET['landkreis'] : '';
$altersgruppe = isset($_GET['altersgruppe']) ? $_GET['altersgruppe'] : '';

// NEW: Determine grouping mode (default to location for the map)
$groupBy = isset($_GET['groupBy']) ? $_GET['groupBy'] : 'location';

// Base SQL
if ($groupBy === 'gender') {
    // Select Gender as the 'name' for the chart
    $sql = "SELECT Geschlecht as name, Jahr, SUM(Wert) as total_wert FROM Opfer_Data WHERE 1=1";
} else {
    // Default: Select Location as 'name' (for Map/Raumdimension)
    $sql = "SELECT Stadt_Landkreis as name, Jahr, SUM(Wert) as total_wert FROM Opfer_Data WHERE 1=1";
}

$params = [];
$types = "";

// Apply filters
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

// Grouping Logic
if ($groupBy === 'gender') {
    $sql .= " GROUP BY Geschlecht, Jahr";
} else {
    $sql .= " GROUP BY Stadt_Landkreis, Jahr";
}

// Execute
$stmt = $verbindung->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'name' => $row['name'],    // Contains either Location or Gender
        'year' => (int) $row['Jahr'],
        'value' => (int) $row['total_wert']
    ];
}

echo json_encode($data);

$stmt->close();
$verbindung->close();
?>