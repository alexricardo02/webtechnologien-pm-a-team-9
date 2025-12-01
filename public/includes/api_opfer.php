<?php
// includes/api_opfer.php
header('Content-Type: application/json');

// Apply filters based on GET parameters

// 1. Open and read the CSV file

$csvFile = '../data/Opfer_Data.csv';

if (!file_exists($csvFile)) {
    echo json_encode(["error" => "File not found"]);
    exit;
}

$handle = fopen($csvFile, "r");
$headers = fgetcsv($handle); // read header row


// 0: Straftat, 1: Gemeindeschluessel, 2: Stadt/Landkreis, ... 5: Wert, 6: Geschlecht
$col_name = 2; 
$col_value = 5;

$results = [];

while (($data = fgetcsv($handle)) !== false) {
    // --- FILTERING ---

    // --- PROCESS ---
    $name = trim(strtolower($data[$col_name])); // Normalize name
    $value = (int)$data[$col_value];

    if (isset($results[$name])) {
        $results[$name] += $value;
    } else {
        $results[$name] = $value;
    }
}

fclose($handle);

// We return only the lightweight array: {"berlin": 5000, "munich": 2000...}
echo json_encode($results);
?>