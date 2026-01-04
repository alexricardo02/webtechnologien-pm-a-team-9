<?php
header('Content-Type: application/json; charset=utf-8');
include 'db.inc.php';

if (!$verbindung) {
    echo json_encode(["error" => "Database Connection Failed"]);
    exit();
}

// -- Erhält und bereinigt die Filter, die main.js über die URL sendet, wenn eine Anfrage an die API gestellt wird. -- 
$jahr = $_GET['jahr'] ?? '';
$geschlecht = $_GET['geschlecht'] ?? '';
$straftat = $_GET['straftat'] ?? '';
$landkreis = $_GET['landkreis'] ?? '';
$groupBy = $_GET['groupBy'] ?? 'location';


// 1. ABFRAGE ERSTELLEN

// 1.1 -- SQL BASIS ABFRAGE -- 
// - Die Spalte wird in „name“ umbenannt. So erhält JavaScript unabhängig vom Diagramm immer dieselbe Datenstruktur.
// - SUM(Wert) als Wert, um alle Zeilen zu addieren, die mit den Filtern übereinstimmen
if ($groupBy === 'gender') { // Logik für Geschlecht
    $sql = "SELECT Geschlecht as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
} elseif ($groupBy === 'straftat') { // Logik für Straftaten
    $sql = "SELECT Straftat_Hauptkategorie as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
} elseif ($groupBy === 'altersgruppe') { // Logik für Altersgruppen
    $sql = "SELECT Altersgruppe as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
} else {
    $sql = "SELECT Stadt_Landkreis as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
}

// Speichert die tatsächlichen Werte in einer separaten Liste, die später an die Datenbank gesendet wird.
$params = [];
$types = "";

// 1.2 -- FILTER --
// Wenn ein Wert vorhanden ist, füge der Abfrage die Anweisung "AND Spalte = ?" hinzu. -> (Prepared Statements)
// - $types: Speichert den Datentyp.
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
// main.js sendet die ausgewählten Landkreise als eine einzige, durch Kommas getrennte Textzeichenfolge, zum Beispiel: „Kiel,Berlin,Mainz”. 
if ($landkreis) {
    // Wir verwenden eine spezielle SQL-Funktion, die eine durch Kommas getrennte Liste durchsucht.
    $sql .= " AND FIND_IN_SET(Stadt_Landkreis, ?)";
    // Wir übergeben die vollständige Variable $landkreis („Kiel, Berlin, Mainz“) unverändert.
    $types .= "s";
    $params[] = $landkreis;
}


// 1.3 -- GROUP BY --
// Je nachdem, wie die Daten gruppiert werden sollen, wird die GROUP BY-Klausel angepasst.
if ($groupBy === 'gender') {
    $sql .= " GROUP BY Geschlecht, Jahr";
} elseif ($groupBy === 'straftat') {
    $sql .= " GROUP BY Straftat_Hauptkategorie, Jahr";
} elseif ($groupBy === 'altersgruppe') {
    $sql .= " GROUP BY Altersgruppe, Jahr";
} else {
    $sql .= " GROUP BY Stadt_Landkreis, Jahr";
}

// 2. PREPARE UND AUSFÜHREN DER ABFRAGE MIT PREPARED STATEMENTS

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

// 3. DATEN SAMMELN UND ALS JSON AUSGEBEN

while ($row = $result->fetch_assoc()) {
    $data[] = [
        "name" => $row['name'], // Landkreis, Geschlecht, Straftat oder Altersgruppe
        "jahr" => $row['Jahr'], // Jahr
        "value" => (int) $row['value'] // Summe der Opferzahlen
    ];
}

echo json_encode($data);