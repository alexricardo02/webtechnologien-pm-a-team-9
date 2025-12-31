<?php
header('Content-Type: application/json; charset=utf-8');
include 'db.inc.php';

if (!$verbindung) {
    echo json_encode(["error" => "Database Connection Failed"]);
    exit();
}

$jahr = $_GET['jahr'] ?? '';
$geschlecht = $_GET['geschlecht'] ?? '';
$straftat = $_GET['straftat'] ?? '';
$landkreis = $_GET['landkreis'] ?? '';
$groupBy = $_GET['groupBy'] ?? 'location';

// 1. SQL Basis
if ($groupBy === 'gender') {
    $sql = "SELECT Geschlecht as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
} elseif ($groupBy === 'straftat') {
    $sql = "SELECT Straftat_Hauptkategorie as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
} elseif ($groupBy === 'altersgruppe') { // <-- NEU: Logik für Altersgruppen
    $sql = "SELECT Altersgruppe as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
} else {
    $sql = "SELECT Stadt_Landkreis as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
}

$params = [];
$types = "";

// Filter
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

if ($landkreis) {
    $landkreisArray = explode(',', $landkreis);

    $placeholders = implode(',', array_fill(0, count($landkreisArray), '?'));

    $sql .= " AND Stadt_Landkreis IN ($placeholders)";

    foreach ($landkreisArray as $name) {
        $types .= "s";
        $params[] = $name;
    }
}


// 2. GROUP BY
if ($groupBy === 'gender') {
    $sql .= " GROUP BY Geschlecht, Jahr";
} elseif ($groupBy === 'straftat') {
    $sql .= " GROUP BY Straftat_Hauptkategorie, Jahr";
} elseif ($groupBy === 'altersgruppe') { // <-- NEU: Gruppierung nach Alter
    $sql .= " GROUP BY Altersgruppe, Jahr";
} else {
    $sql .= " GROUP BY Stadt_Landkreis, Jahr";
}

$stmt = $verbindung->prepare($sql);
if (!$stmt) {
    echo json_encode(["error" => "SQL Prepare Error", "details" => $verbindung->error]);
    exit();
}

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = [
        "name" => $row['name'],
        "jahr" => $row['Jahr'],
        "value" => (int) $row['value']
    ];
}

echo json_encode($data);