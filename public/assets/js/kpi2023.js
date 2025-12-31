document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing KPI 2023 (CSV Mode - Sum Everything)...");

    const csvUrl = './data/Opfer_Data.csv';

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`CSV not found at ${csvUrl}`);
            }
            return response.text();
        })
        .then(csvText => {
            // Calculate Sum for 2023 (Summing ALL rows)
            const total2023 = calculateSumFromCSV(csvText, '2023');

            // Update Display
            const display = document.getElementById('val-2023');
            if (display) {
                display.innerText = total2023.toLocaleString('de-DE');
            }
        })
        .catch(err => {
            console.error('KPI 2023 CSV Error:', err);
            const display = document.getElementById('val-2023');
            if (display) display.innerText = "0";
        });
});

/**
 * Shared logic to sum values from CSV for a specific year.
 * NOW SUMS EVERYTHING (No Crime Type Filter).
 */
function calculateSumFromCSV(csvText, targetYear) {
    const lines = csvText.split('\n');
    let totalSum = 0;

    // 1. Find Column Indexes dynamically
    const headers = lines[0].trim().split(',');
    const indexJahr = headers.indexOf('Jahr');
    const indexWert = headers.indexOf('Wert');

    // Safety check: ensure required columns exist
    if (indexJahr === -1 || indexWert === -1) {
        console.error("CSV Missing required columns (Jahr, Wert)");
        return 0;
    }

    // 2. Iterate through rows (start at 1 to skip header)
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].trim();
        if (!row) continue;

        const cols = row.split(',');

        // Safety: Ensure row has enough columns
        if (cols.length < headers.length) continue;

        // 3. Filter and Sum
        // Only condition: Check if Year matches
        if (cols[indexJahr] === targetYear) {

            // REMOVED: The filter for "Straftaten insgesamt" is gone.
            // We now sum everything regardless of crime type.

            // Parse the number
            const val = parseInt(cols[indexWert]) || 0;
            totalSum += val;
        }
    }
    return totalSum;
}