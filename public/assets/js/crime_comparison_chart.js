const renderCrimeComparisonChart = (chartData) => {
    const ctx = document.getElementById('crimeComparisonChart');
    if (!ctx) return;

    const totals = {};

    try {

        chartData.forEach(item => {
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
                    title: { display: true, text: 'Opferzahlen nach Straftat', font: { size: 16 } },
                }
            }
        });

    } catch (error) {
        console.error("Fehler bei der Chart-Aktualisierung:", error);
    }


};


window.initCrimeComparisonChart = renderCrimeComparisonChart