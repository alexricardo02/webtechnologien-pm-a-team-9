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
$altersgruppe = $_GET['altersgruppe'] ?? ''; // NEW: Capture Age Filter
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
    $sql = "SELECT Gemeindeschluessel as id, Stadt_Landkreis as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
}

$params = [];
$types = "";

// --- KRISITSCHE LOGIK FÜR STRAFTAT UM DUPLIKATE ZU VERMEIDEN --- 
if ($straftat && $straftat !== 'all' && $straftat !== '') {
    $sql .= " AND Straftat_Hauptkategorie = ?";
    $types .= "s";
    $params[] = $straftat;
} else {
    // WENN KEINE BESTIMMTE STRAFTAT ANGEFORDERT WIRD, DANN NUR DEN GESAMTWERT ABRUFEN
    if ($groupBy !== 'straftat') {
        $sql .= " AND Straftat_Hauptkategorie = 'Insgesamt'";
    } else {
        // Wenn wir nach Kategorie gruppieren (z.B. für einen Balkendiagramm), dann ignorieren wir den Gesamtwert, damit er nicht als riesige Balken erscheint.
        $sql .= " AND Straftat_Hauptkategorie != 'Insgesamt'";
    }
}


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
// Filter: Altersgruppe (NEW - This was missing!)
if ($altersgruppe && $altersgruppe !== 'all') {
    $sql .= " AND Altersgruppe = ?";
    $types .= "s";
    $params[] = $altersgruppe;
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
} elseif ($groupBy === 'altersgruppe') {
    $sql .= " GROUP BY Altersgruppe, Jahr";
} else {
    $sql .= " GROUP BY Gemeindeschluessel, Stadt_Landkreis, Jahr";
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

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $item = [
            "name" => $row['name'] ?? 'N/A',
            "jahr" => $row['Jahr'] ?? null,
            "value" => isset($row['value']) ? (int) $row['value'] : 0
        ];

        // 2. Wenn id existiert, fügen wir sie hinzu
        if (array_key_exists('id', $row)) {
            $item["id"] = $row['id'];
        }

        $data[] = $item;
    }
}


echo json_encode($data);