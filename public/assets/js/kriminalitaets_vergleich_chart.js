/**
 * Rendert das einfache Balkendiagramm für den Straftaten-Vergleich.
 * Summiert alle Jahre für die gewählten Kategorien.
 */
const renderCrimeComparisonChart = (chartData) => {
    const ctx = document.getElementById('crimeComparisonChart');
    if (!ctx) return;

    // Feste Kategorien definieren (Synchron zum Stacked Chart)
    const categories = [
        "Gewaltkriminalität",
        "Tötung & Körperverletzung",
        "Sexualdelikte",
        "Raubdelikte",
        "Widerstand & Angriff",
    ];

    // Daten summieren (2023 + 2024 zusammenrechnen)
    const grouped = {};
    let totalSum = 0;

    chartData.forEach((item) => {
        const cat = item.name;
        const val = parseInt(item.value || 0);

        if (categories.includes(cat)) {
            if (!grouped[cat]) grouped[cat] = 0;
            grouped[cat] += val;
            totalSum += val; 
        }
    });

    // Daten in die richtige Reihenfolge bringen
    const finalValues = categories.map((c) => (grouped[c] ? grouped[c] : 0));

    // Chart-Instanz verwalten
    if (window.crimeChartInstance) {
        window.crimeChartInstance.destroy();
    }

    // Chart erstellen
    window.crimeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Anzahl Opfer (Gesamtzeitraum)',
                data: finalValues,
                backgroundColor: '#0055A5', 
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { 
                    display: true, 
                    text: 'Opferzahlen nach Straftat', 
                    font: { size: 16, weight: 'bold' } 
                },
                tooltip: {
                    callbacks: {
                        label: (context) => context.raw.toLocaleString('de-DE') + ' Opfer'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => value.toLocaleString('de-DE')
                    }
                }
            }
        }
    });
};

window.initCrimeComparisonChart = renderCrimeComparisonChart;