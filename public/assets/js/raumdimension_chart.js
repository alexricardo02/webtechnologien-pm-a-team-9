document.addEventListener('DOMContentLoaded', () => {

    // 1. Hilfsfunktion zum Auslesen der Filter und Erstellen der URL-Parameter
    const getFilterParams = () => {
        const jahr = document.getElementById('filter-jahr').value;
        const geschlecht = document.getElementById('filter-geschlecht').value;
        const straftat = document.getElementById('filter-straftat').value;

        const params = new URLSearchParams();
        if (jahr) params.append('jahr', jahr);
        if (geschlecht) params.append('geschlecht', geschlecht);
        if (straftat) params.append('straftat', straftat);
        
        return params.toString();
    };

    // 2. Hauptfunktion zum Rendern eines einzelnen Charts
    const renderChart = (elementId, listMode, filterParams, titleText, colorScheme, indexAxis = 'x', showTitle = true, minHeight = 350) => {
        
        const apiUrl = `includes/api_opfer.php?list=${listMode}&${filterParams}`;
        
        const ctx = document.getElementById(elementId);
        if (ctx) {
            ctx.style.minHeight = `${minHeight}px`; 
        } else {
             return;
        }

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Netzwerk-Antwort für ${titleText} war nicht OK.`);
                }
                return response.json();
            })
            .then(data => {
                const labels = Object.keys(data).map(name => {
                    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                });
                const values = Object.values(data);
                
                if (window[elementId + 'Instance']) {
                     window[elementId + 'Instance'].destroy();
                }

                window[elementId + 'Instance'] = new Chart(ctx, {
                    type: 'bar', 
                    data: { labels, datasets: [{
                        label: 'Opferzahlen', data: values, backgroundColor: colorScheme, borderWidth: 1, borderRadius: 4
                    }]},
                    options: {
                        indexAxis: indexAxis, responsive: true, maintainAspectRatio: false, 
                        plugins: {
                            legend: { display: false },
                            title: {
                                display: showTitle, text: titleText, font: { size: 16, weight: 'bold' }
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                title: { display: true, text: (indexAxis === 'x' ? 'Opferzahl' : '') }
                            },
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: (indexAxis === 'y' ? 'Opferzahl' : '') },
                                grid: { display: false }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error(`Fehler beim Abrufen der Daten für ${titleText}:`, error);
                const placeholder = document.getElementById(elementId).parentNode;
                if (placeholder) {
                     placeholder.innerHTML = `<p class="error-message" style="color: red; text-align: center; padding: 20px;">${titleText} Daten konnten nicht geladen werden.</p>`;
                }
            });
    };
    
    const updateCharts = () => {
        const filterParams = getFilterParams();

        // TOP 5 (Horizontal)
        const top5_colors = ['#0055A5', '#347AB8', '#599DD1', '#7EBBE0', '#A3D8EF']; 
        renderChart(
            'opferChart', 
            'top5',
            filterParams, 
            'Top 5 Landkreise (Höchste Opferzahlen)',
            top5_colors,
            'y', 
            false, 
            350 
        );

        // BOTTOM 5 (Vertikal)
        const bottom5_colors = ['#00B4D8', '#48C9B0', '#76D7C4', '#A9CCE3', '#D6EAF8']; 
        renderChart(
            'chartId', 
            'bottom5',
            filterParams, 
            'Bottom 5 Landkreise (Niedrigste Opferzahlen > 0)',
            bottom5_colors,
            'x', 
            false, 
            300 
        );

        console.log("Charts aktualisiert mit Filtern:", filterParams);
    };

    const applyButton = document.getElementById('apply-filters');
    if (applyButton) {
        applyButton.addEventListener('click', updateCharts);
    }

    updateCharts();
});