<?php

/* Die Hauptfunktion besteht darin, die vom Benutzer ausgewählten Filter zu empfangen, 
 * eine dynamische SQL-Abfrage zu erstellen, diese sicher auszuführen und die Ergebnisse 
 * im JSON-Format zurückzugeben.
 */

header('Content-Type: application/json; charset=utf-8');
include 'db.inc.php';

if (!$verbindung) {
    echo json_encode(["error" => "Database Connection Failed"]);
    exit();
}

// Filter extrahieren

if (isset($_GET['jahr'])) {
    $jahr = $_GET['jahr'];
} else {
    $jahr = "";
}

if (isset($_GET['geschlecht'])) {
    $geschlecht = $_GET['geschlecht'];
} else {
    $geschlecht = "";
}

if (isset($_GET['straftat'])) {
    $straftat = $_GET['straftat'];
} else {
    $straftat = "";
}

if (isset($_GET['altersgruppe'])) {
    $altersgruppe = $_GET['altersgruppe'];
} else {
    $altersgruppe = "";
}

if (isset($_GET['landkreis'])) {
    $landkreis = $_GET['landkreis'];
} else {
    $landkreis = "";
}
// Lege fest, welche Grafik die Daten anfordert. Wenn keine Filter, dann alle Daten für die Karte anfordern.
if (isset($_GET['groupBy'])) {
    $groupBy = $_GET['groupBy'];
} else {
    $groupBy = "location";
}

// -- SQL ABFRAGE BILDEN --


// 1. SQL Basisabfrage

switch ($groupBy) {
    case "gender": // Für die Gender Grafik
        $sql = "SELECT Geschlecht as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
        break;

    case "straftat": // Für die Straftaten Grafik
        $sql = "SELECT Straftat_Hauptkategorie as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
        break;

    case "altersgruppe": // Für die Altersgruppen Grafik
        $sql = "SELECT Altersgruppe as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
        break;

    default:
        // Für Karte und Rankings
        $sql = "SELECT Gemeindeschluessel as id, Stadt_Landkreis as name, Jahr, SUM(Wert) as value FROM Opfer_Data WHERE 1=1";
        break;
}

// Für prepared statements
$params = []; // Array, in dem die tatsächlichen Werte der Filter gespeichert werden.
$types = ""; // Datentypen für prepared statements.


// 2. Filter eingeben

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

// MEHRFACHAUSWAHL FILTERN

if ($altersgruppe && $altersgruppe !== 'all') {
    $sql .= " AND Altersgruppe = ?";
    $types .= "s";
    $params[] = $altersgruppe;
}

// --- LOGIK FÜR STRAFTAT UM DUPLIKATE ZU VERMEIDEN --- 
if ($straftat && $straftat !== 'all' && $straftat !== '') {

    $straftatArray = explode(',', $straftat);

    $straftatListe = implode(',', array_fill(0, count($straftatArray), '?'));

    $sql .= " AND Straftat_Hauptkategorie IN ($straftatListe)";

    foreach ($straftatArray as $name) {
        $types .= "s";
        $params[] = $name;
    }
} else {
    // WENN KEINE BESTIMMTE STRAFTAT ANGEFORDERT WIRD, DANN NUR DEN GESAMTWERT (INSGESAMT) ABRUFEN.
    if ($groupBy !== 'straftat') {
        $sql .= " AND Straftat_Hauptkategorie = 'Insgesamt'";
    } else {
        // Wenn wir nach Kategorie gruppieren (z.B. für einen Balkendiagramm), dann ignorieren wir den Gesamtwert, damit er nicht als riesige Balken erscheint.
        $sql .= " AND Straftat_Hauptkategorie != 'Insgesamt'";
    }
}

//--- LOGIK FÜR LANDKREISE UM DUPLIKATE ZU VERMEIDEN --- 
// Für den Filter $landkreis wird explode verwendet, um die Textliste in ein Array umzuwandeln, und es werden so viele Fragezeichen (?) generiert, wie Bezirke ausgewählt wurden.
if ($landkreis) {
    $landkreisArray = explode(',', $landkreis);

    $landkreisListe = implode(',', array_fill(0, count($landkreisArray), '?'));

    $sql .= " AND Stadt_Landkreis IN ($landkreisListe)";

    foreach ($landkreisArray as $name) {
        $types .= "s";
        $params[] = $name;
    }
}


// 3. GROUP BY

if ($groupBy === 'gender') {
    $sql .= " GROUP BY Geschlecht, Jahr";
} elseif ($groupBy === 'straftat') {
    $sql .= " GROUP BY Straftat_Hauptkategorie, Jahr";
} elseif ($groupBy === 'altersgruppe') {
    $sql .= " GROUP BY Altersgruppe, Jahr";
} else {
    $sql .= " GROUP BY Gemeindeschluessel, Stadt_Landkreis, Jahr";
}


// 4. Prepared Statements erstellen

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
$data = []; // Daten zu verschicken

// 5. Daten in ein Array schreiben

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $item = array();

        // name: Landkreisname/Straftat/Altersgruppe/Geschlecht
        if (isset($row['name'])) {
            $item["name"] = $row['name'];
        } else {
            $item["name"] = "N/A";
        }

        // jahr
        if (isset($row['Jahr'])) {
            $item["jahr"] = $row['Jahr'];
        } else {
            $item["jahr"] = null;
        }

        // wert
        if (isset($row['value'])) {
            $item["value"] = (int)$row['value'];
        } else {
            $item["value"] = 0;
        }

        // id (Gemeindeschluessel) nur für die Karte
        if (isset($row['id'])) {
            $item["id"] = $row['id'];
        }

        array_push($data, $item);
    }
}

echo json_encode($data);




