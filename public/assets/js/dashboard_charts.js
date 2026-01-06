

const renderChart = (elementId, chartData, titleText, colorScheme, indexAxis = 'x', showTitle = true, minHeight = 350) => {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;

    ctx.style.minHeight = `${minHeight}px`;


    // Vorherige Instanz zerstören (wenn vorhanden)
    if (window[elementId + 'Instance']) {
        window[elementId + 'Instance'].destroy();
    }

    const labels = chartData.map(d => {
        return d.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    });

    const values = chartData.map(d => d.value);

    window[elementId + 'Instance'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Opferzahlen',
                data: values,
                backgroundColor: colorScheme,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: indexAxis,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: showTitle,
                    text: titleText,
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: (indexAxis === 'x' ? 'Opferzahl' : '')
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: (indexAxis === 'y' ? 'Opferzahl' : '')
                    },
                    grid: { display: false }
                }
            }
        }
    });
};

// --- Main Funktion (Durch main.js) ---
window.initDashboardCharts = function (rawData) {

    // 1. Daten durch Landkreis gruppiern und (Wenn Daten duplikate haben, summieren)
    let districtAggregation = {};
    rawData.forEach(item => {
        let name = item.name;
        let val = parseInt(item.value || 0);
        if (!districtAggregation[name]) districtAggregation[name] = 0;
        districtAggregation[name] += val;
    });

    // In Array umwandeln 
    let aggregatedArray = Object.entries(districtAggregation).map(([key, val]) => ({
        name: key,
        value: val
    }));

    // Mehr-als-10-Landkreise-Warnung anzeigen/verstecken
    const warningElement = document.getElementById('limitWarning');
    if (warningElement) {
        // Wenn user mehr als 10 Landkreise hat, Warnung anzeigen
        if (aggregatedArray.length > 10) {
            warningElement.style.display = 'block';
        } else {
            warningElement.style.display = 'none';
        }
    }

    // 2. Top 5 berechnen
    let top5 = [...aggregatedArray].sort((a, b) => b.value - a.value).slice(0, 5);

    // 3. Bottom 5 berechnen (nur Werte > 0)
    let bottom5 = [...aggregatedArray]
        .filter(i => i.value > 0)
        .sort((a, b) => a.value - b.value)
        .slice(0, 5);

    let opferNachLandkreisenBis10 = [...aggregatedArray]
        .filter(i => i.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    // 4. Render
    const top5_colors = ['#0055A5', '#347AB8', '#599DD1', '#7EBBE0', '#A3D8EF'];
    const bottom5_colors = ['#00B4D8', '#48C9B0', '#76D7C4', '#A9CCE3', '#D6EAF8'];
    const bis10_colors = ['#023E8A', '#0077B6', '#0096C7', '#00B4D8', '#48CAE4', '#90E0EF', '#ADE8F4', '#CAF0F8', '#E0FBFC', '#F1FAFF'];

    renderChart('top5chart', top5, 'Top 5 Landkreise', top5_colors, 'y');
    renderChart('bottom5chart', bottom5, 'Bottom 5 Landkreise', bottom5_colors, 'y');
    renderChart('opferNachLandkreisenBis10Chart', opferNachLandkreisenBis10, 'Opferzahlen nach Landkreisen', bis10_colors, 'y', true, 400);
};
