
const renderAgeChart = (chartData) => {
    const ctx = document.getElementById('ageChart');
    if (!ctx) return;

    if (window.ageChartInstance) {
        window.ageChartInstance.destroy();
    }

    // 1. Define Buckets
    let buckets = {
        'Kinder unter 6 Jahren': 0,
        'Kinder 6 bis unter 14 Jahren': 0,
        'Jugendliche 14 bis unter 18 Jahren': 0,
        'Heranwachsende 18 bis unter 21 Jahren': 0,
        'Erwachsene 21 bis unter 60 Jahren': 0,
        'Erwachsene 60 Jahre und älter': 0
    };

    // 2. Sort Data (Process of Elimination)
    let hasData = false;

    if (chartData && chartData.length > 0) {
        chartData.forEach(item => {
            const str = (item.name || "").toLowerCase(); 
            const val = parseInt(item.value) || 0;
            if (val > 0) hasData = true;

            // --- DEBUG: Check the Console to see your raw data ---
            // console.log("Processing Row:", str, "Value:", val);

            // 1. Seniors (60+) - Must check first to avoid mixing with 21-60
            if (str.includes('aelter') || str.includes('älter') || (str.includes('60') && str.includes('und'))) {
                buckets['Erwachsene 60 Jahre und älter'] += val;
            }
            // 2. Children < 6
            else if (str.includes('unter 6')) {
                buckets['Kinder unter 6 Jahren'] += val;
            }
            // 3. Children 6-14
            else if (str.includes('6') && str.includes('14')) {
                buckets['Kinder 6 bis unter 14 Jahren'] += val;
            }
            // 4. Youth 14-18
            else if (str.includes('14') && str.includes('18')) {
                buckets['Jugendliche 14 bis unter 18 Jahren'] += val;
            }
            // 5. Young Adults 18-21
            else if (str.includes('18') && str.includes('21')) {
                buckets['Heranwachsende 18 bis unter 21 Jahren'] += val;
            }
            // 6. Adults 21-60 (THE CATCH-ALL)
            // If it wasn't any of the above, AND it contains "21", "60" or "erwachsene", 
            // it belongs here. We are very generous with the match now.
            else if (str.includes('21') || str.includes('60') || str.includes('erwachsene')) {
                buckets['Erwachsene 21 bis unter 60 Jahren'] += val;
                // console.log("Caught in 21-60 bucket:", str);
            }
            else {
                // If data ends up here, it doesn't match ANY age group.
                console.warn("IGNORED DATA:", str);
            }
        });
    }

    // 3. Fallback: Demo Data
    if (!hasData) {
        console.warn("Age Chart: No data found. Switching to Demo Mode.");
        buckets = {
            'Kinder unter 6 Jahren': 2340,
            'Kinder 6 bis unter 14 Jahren': 5120,
            'Jugendliche 14 bis unter 18 Jahren': 8430,
            'Heranwachsende 18 bis unter 21 Jahren': 7210,
            'Erwachsene 21 bis unter 60 Jahren': 45100,
            'Erwachsene 60 Jahre und älter': 12500
        };
    }

    // 4. Render
    window.ageChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(buckets),
            datasets: [{
                label: 'Opferzahl',
                data: Object.values(buckets),
                backgroundColor: ['#A3D8EF', '#7EBBE0', '#599DD1', '#347AB8', '#0055A5', '#002b55'],
                borderRadius: 4,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { 
                    display: true, 
                    text: hasData ? 'Opfer nach Altersgruppen' : 'Opfer nach Altersgruppen (Demo)',
                    font: { size: 16 } 
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${ctx.raw.toLocaleString()} Opfer`
                    }
                }
            },
            scales: {
                y: { beginAtZero: true },
                x: { grid: { display: false } }
            }
        }
    });
};

window.initAgeChart = renderAgeChart;