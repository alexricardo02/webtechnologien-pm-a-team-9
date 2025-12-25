async function updateCrimeComparisonChart(filters = {}) {
    const params = new URLSearchParams();
    params.append('groupBy', 'straftat');
    
    if (filters.jahr && filters.jahr !== 'all') params.append('jahr', filters.jahr);
    if (filters.geschlecht && filters.geschlecht !== 'all') params.append('geschlecht', filters.geschlecht);
    if (filters.landkreis && filters.landkreis !== 'all') params.append('landkreis', filters.landkreis);

    try {
        const response = await fetch(`includes/api_opfer.php?${params.toString()}&t=${Date.now()}`);
        const rawData = await response.json();

        const ctx = document.getElementById('crimeComparisonChart');
        if (!ctx) return;

        const totals = {};
        
        rawData.forEach(item => {
            if (!item.name) return;
            
            // Namen vereinheitlichen (Trimmen und Großschreiben für den Vergleich)
            const key = item.name.trim().toLowerCase();
            const val = parseInt(item.value || 0);
            
            if (totals[key]) {
                totals[key].value += val;
            } else {
                totals[key] = {
                    originalName: item.name.trim(), 
                    value: val
                };
            }
        });

        const finalLabels = [];
        const finalValues = [];

        for (let key in totals) {
            finalLabels.push(totals[key].originalName);
            finalValues.push(totals[key].value);
        }

        if (window.crimeChartInstance) {
            window.crimeChartInstance.destroy();
        }

        window.crimeChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: finalLabels,
                datasets: [{
                    label: 'Anzahl Opfer (Summe)',
                    data: finalValues,
                    backgroundColor: '#0055A5',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Opferzahlen nach Straftat' }
                }
            }
        });

    } catch (error) {
        console.error("Fehler bei der Chart-Aktualisierung:", error);
    }
}

// Event Listener für den Filter-Button sicherstellen
document.addEventListener('DOMContentLoaded', () => {
    updateCrimeComparisonChart();
    
    const applyBtn = document.getElementById('apply-filters');
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const f = {
                jahr: document.getElementById('filter-jahr')?.value || 'all',
                geschlecht: document.getElementById('filter-geschlecht')?.value || 'all',
                landkreis: document.getElementById('filter-landkreis')?.value || 'all'
            };
            updateCrimeComparisonChart(f);
        });
    }
});