document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing KPI 2024 (CSV Mode - Sum Everything)...");

    // Switched to CSV to control the Year filter on the client side
    const csvUrl = './data/Opfer_Data.csv';

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`CSV not found at ${csvUrl}`);
            }
            return response.text();
        })
        .then(csvText => {
            // Re-use the helper function from kpi2023.js if loaded, 
            // or use local logic if 2023 didn't load. 
            // For safety, we define the logic here inline or assume the global function exists.
            // To be safe and independent:
            
            const total2024 = calculateSum2024(csvText, '2024');

            // Update Display
            const display = document.getElementById('val-2024');
            if (display) {
                display.innerText = total2024.toLocaleString('de-DE');
            }
        })
        .catch(err => {
            console.error('KPI 2024 CSV Error:', err);
            const display = document.getElementById('val-2024');
            if(display) display.innerText = "-";
        });
});

function calculateSum2024(csvText, targetYear) {
    const lines = csvText.split('\n');
    let totalSum = 0;

    const headers = lines[0].trim().split(',');
    const indexJahr = headers.indexOf('Jahr');
    const indexWert = headers.indexOf('Wert');

    if (indexJahr === -1 || indexWert === -1) return 0;

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].trim();
        if (!row) continue;

        const cols = row.split(',');
        if (cols.length < headers.length) continue;

        // Only condition: Check if Year matches 2024
        if (cols[indexJahr] === targetYear) {
            // Sum everything regardless of crime type
            const val = parseInt(cols[indexWert]) || 0;
            totalSum += val;
        }
    }
    return totalSum;
}