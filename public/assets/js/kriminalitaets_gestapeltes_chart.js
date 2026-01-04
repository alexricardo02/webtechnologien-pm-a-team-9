/**
 * Erstellt das gestapelte Balkendiagramm (Immer Vergleich 2023 vs. 2024)
 * Diese Funktion ignoriert den Jahres-Filter der UI, um den Vergleich zu garantieren.
 */
const renderCrimeStackedChart = (chartData) => {
    const ctx = document.getElementById("crimeStackedChart");
    if (!ctx) return;

    // Feste Kategorien (Exakt wie Vergleich Chart)
    const categories = [
        "Gewaltkriminalität",
        "Tötung & Körperverletzung",
        "Sexualdelikte",
        "Raubdelikte",
        "Widerstand & Angriff",
    ];

    // Daten nach Kategorie und Jahr gruppieren
    const grouped = {};
    chartData.forEach((item) => {
        const cat = item.name ? item.name.trim() : "";
        const year = item.jahr;
        const val = parseInt(item.value || 0);

        if (categories.includes(cat)) {
            if (!grouped[cat]) grouped[cat] = { 2023: 0, 2024: 0 };
            if (year == "2023" || year == "2024") {
                grouped[cat][year] += val;
            }
        }
    });

    // Arrays für die Datensätze erstellen
    const data2023 = categories.map((c) => (grouped[c] ? grouped[c]["2023"] : 0));
    const data2024 = categories.map((c) => (grouped[c] ? grouped[c]["2024"] : 0));

    // Instanz-Management
    if (window.crimeStackedInstance) {
        window.crimeStackedInstance.destroy();
    }

    // Chart-Erstellung
    window.crimeStackedInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: categories,
            datasets: [
                {
                    label: "2023",
                    data: data2023,
                    backgroundColor: "#0055A5", // Dunkelblau
                    borderRadius: 4,
                },
                {
                    label: "2024",
                    data: data2024,
                    backgroundColor: "#00B4D8", // Hellblau
                    borderRadius: 4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { 
                    stacked: true 
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: { display: true, text: "Anzahl Opfer" },
                    ticks: {
                        // Tausendertrennzeichen für die Achse
                        callback: (value) => value.toLocaleString('de-DE')
                    }
                },
            },
            plugins: {
                legend: { position: "top" },
                title: {
                    display: true,
                    text: "Jahresvergleich der Opferzahlen (Gestapelt)",
                    font: { size: 16 },
                },
                tooltip: {
                    callbacks: {
                        // Tausendertrennzeichen für die Tooltips beim Hovern
                        label: (context) => {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toLocaleString('de-DE') + ' Opfer';
                            }
                            return label;
                        }
                    }
                }
            },
        },
    });
};

window.initCrimeStackedChart = renderCrimeStackedChart;