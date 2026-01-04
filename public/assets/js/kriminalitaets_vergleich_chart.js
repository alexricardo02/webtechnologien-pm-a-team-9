const renderCrimeComparisonChart = (chartData) => {
    const ctx = document.getElementById('crimeComparisonChart');
    if (!ctx) return;

    // --- NEU: FESTE KATEGORIEN DEFINIEREN ---
    // Das sorgt dafür, dass die Balken links im Bild immer da bleiben.
    const fixedCategories = [
        "Tötung & Körperverletzung",
        "Sexualdelikte",
        "Raubdelikte",
        "Widerstand & Angriff",
    ];

    const totals = {};
    
    // --- NEU: INITIALISIERUNG ---
    // Wir füllen das Objekt zuerst mit 0 für alle Kategorien
    fixedCategories.forEach(cat => {
        totals[cat.toLowerCase()] = {
            originalName: cat,
            value: 0
        };
    });

    try {
        chartData.forEach(item => {
            if (!item.name) return;

            const key = item.name.trim().toLowerCase();
            const val = parseInt(item.value || 0);

            // Deinen bestehenden Check beibehalten, aber nur für Kategorien in unserer Liste
            if (totals[key]) {
                totals[key].value += val;
            } else if (key !== "insgesamt") { 
                // Falls eine neue Kategorie in der DB auftaucht, die nicht in der Liste ist
                totals[key] = {
                    originalName: item.name.trim(),
                    value: val
                };
            }
        });

        const finalLabels = [];
        const finalValues = [];

        // --- ANPASSUNG: REIHENFOLGE ---
        // Wir gehen die festen Kategorien durch, damit die Sortierung immer gleich bleibt
        fixedCategories.forEach(cat => {
            const key = cat.toLowerCase();
            finalLabels.push(totals[key].originalName);
            finalValues.push(totals[key].value);
        });

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
                },
                // --- NEU: Y-ACHSE FIXIEREN ---
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error("Fehler bei der Chart-Aktualisierung:", error);
    }
};

window.initCrimeComparisonChart = renderCrimeComparisonChart;