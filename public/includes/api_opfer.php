<?php
header('Content-Type: application/json');

// Straftat, Gemeindeschluessel, Stadt/Landkreis, Fallstatus, Jahr, Wert, Geschlecht, Altersgruppe, Straftat Hauptkategorie
$col_straftat = 0;
$col_gemeindeschluessel = 1;
$col_name = 2;        
$col_jahr = 4;
$col_value = 5;           
$col_geschlecht = 6;
$col_altersgruppe = 7;
$col_hauptkategorie = 8; 


// 1. Filter aus GET-Parametern abrufen
$filter_jahr = isset($_GET['jahr']) ? trim(strtolower($_GET['jahr'])) : null;
$filter_geschlecht = isset($_GET['geschlecht']) ? trim(strtolower($_GET['geschlecht'])) : null;
$filter_straftat = isset($_GET['straftat']) ? trim(strtolower($_GET['straftat'])) : null;
$list_mode = isset($_GET['list']) ? trim(strtolower($_GET['list'])) : 'all'; 

// Cache Datei in Bezug auf Filter erstellen
// list mode ist für top 5, bottom 5, usw.
$cacheKey = "cache_" . 
            ($filter_jahr ?? 'all') . "_" . 
            ($filter_geschlecht ?? 'all') . "_" . 
            ($filter_straftat ?? 'all') . "_" . 
            ($list_mode) . ".json"; 

$cacheFile = '../data/cache/' . $cacheKey;

// Wenn cache schon existiert (und nicht älter als 24h ist), laden
if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < 86400)) {
    readfile($cacheFile);
    exit;
}

// Wenn cache nicht existiert, CSV lesen und filtern
// 2. CSV-Datei öffnen und lesen
$csvFile = '../data/Opfer_Data.csv';

if (!file_exists($csvFile)) {
    echo json_encode(["error" => "File not found: " . $csvFile]);
    exit;
}

$handle = fopen($csvFile, "r");
$headers = fgetcsv($handle); 

$results = []; 

while (($data = fgetcsv($handle)) !== false) {
    if (count($data) < 9) continue; 

    if ($filter_jahr !== null && trim(strtolower($data[$col_jahr])) !== $filter_jahr) {
        continue;
    }
    if ($filter_geschlecht !== null && trim(strtolower($data[$col_geschlecht])) !== $filter_geschlecht) {
        continue;
    }
    
    if ($filter_straftat !== null && $filter_straftat !== '' && trim(strtolower($data[$col_hauptkategorie])) !== $filter_straftat) {
        continue;
    }

    $name = trim(strtolower($data[$col_name])); 
    $value = (int)$data[$col_value];

    if (isset($results[$name])) {
        $results[$name] += $value;
    } else {
        $results[$name] = $value;
    }
}

fclose($handle);

// 3. Top 5, Bottom 5 oder Alles bestimmen
$final_results = $results;

if ($list_mode === 'top5') {
    arsort($results);
    $final_results = array_slice($results, 0, 5, true); 

} elseif ($list_mode === 'bottom5') {
    $non_zero_results = array_filter($results, function($value) {
        return $value > 0;
    });
    asort($non_zero_results);
    $final_results = array_slice($non_zero_results, 0, 5, true);
} 

$jsonOutput = json_encode($final_results);
if (!is_dir('../data/cache')) mkdir('../data/cache', 0777, true);
file_put_contents($cacheFile, $jsonOutput);


echo $jsonOutput;
?>