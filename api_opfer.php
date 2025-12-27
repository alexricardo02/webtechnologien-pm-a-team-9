<?php
header('Content-Type: application/json; charset=utf-8');
include 'db.inc.php';

if (!$verbindung) {
    echo json_encode(["error" => "Database Connection Failed"]);
    exit();
}

// Fetch Parameters
$jahr = $_GET['jahr'] ?? '';
$geschlecht = $_GET['geschlecht'] ?? '';
$straftat = $_GET['straftat'] ?? '';
$landkreis = $_GET['landkreis'] ?? '';
$groupBy = $_GET['groupBy'] ?? 'location';

// --- 1. SQL Selection Logic ---
if ($groupBy === 'gender') {
    $sql = "SELECT Geschlecht as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
} elseif ($groupBy === 'straftat') {
    $sql = "SELECT Straftat_Hauptkategorie as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
} elseif ($groupBy === 'altersgruppe') {
    // --- SCRUM-209: RAW DATA MODE ---
    // We do NOT rename here. We send the messy raw text to JavaScript.
    // This bypasses all SQL encoding/spelling errors.
    $sql = "SELECT Altersgruppe as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
} else {
    $sql = "SELECT Stadt_Landkreis as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
}

$params = [];
$types = "";

// --- 2. Filter Logic ---
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

// --- 3. Group By Logic ---
if ($groupBy === 'gender') {
    $sql .= " GROUP BY Geschlecht, Jahr";
} elseif ($groupBy === 'straftat') {
    $sql .= " GROUP BY Straftat_Hauptkategorie, Jahr";
} elseif ($groupBy === 'altersgruppe') {
    // Group by the raw column name
    $sql .= " GROUP BY Altersgruppe, Jahr";
} else {
    $sql .= " GROUP BY Stadt_Landkreis, Jahr";
}

// --- 4. Execution ---
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
        "name" => $row['name'], // Sends "Kinder bis unter 6 Jahre" (messy)
        "jahr" => $row['Jahr'], 
        "value" => (int)$row['value']
    ];
}

echo json_encode($data);
?>