/**
 * Erstellt das gestapelte Balkendiagramm (Immer Vergleich 2023 vs. 2024)
 * Diese Funktion ignoriert den Jahres-Filter der UI, um den Vergleich zu garantieren.
 */
window.initCrimeStackedChart = async (currentFilters) => {
    const ctx = document.getElementById('crimeStackedChart');
    if (!ctx) return;

    // Erstellen eigene Parameter OHNE das Jahr, damit immer beide bekommen
    const params = new URLSearchParams();
    params.append('groupBy', 'straftat'); 
    
    // Andere Filter wie Geschlecht oder Landkreis übernehmen 
    if (currentFilters.geschlecht && currentFilters.geschlecht !== 'all') params.append('geschlecht', currentFilters.geschlecht);
    if (currentFilters.landkreis && currentFilters.landkreis !== 'all') params.append('landkreis', currentFilters.landkreis);
    if (currentFilters.straftat && currentFilters.straftat !== 'all') params.append('straftat', currentFilters.straftat);

    try {
        const response = await fetch(`includes/api_opfer.php?${params.toString()}`);
        const data = await response.json();

        const categories = [
            "Tötung & Körperverletzung",
            "Sexualdelikte",
            "Raubdelikte",
            "Widerstand & Angriff",
            "Insgesamt"
        ];

        const grouped = {};
        data.forEach(item => {
            const cat = item.name;
            const year = item.jahr; 
            const val = parseInt(item.value || 0);

            if (categories.includes(cat)) {
                if (!grouped[cat]) grouped[cat] = { "2023": 0, "2024": 0 };
                if (year == "2023" || year == "2024") {
                    grouped[cat][year] += val;
                }
            }
        });

        const data2023 = categories.map(c => grouped[c] ? grouped[c]["2023"] : 0);
        const data2024 = categories.map(c => grouped[c] ? grouped[c]["2024"] : 0);

        if (window.crimeStackedInstance) {
            window.crimeStackedInstance.destroy();
        }

        window.crimeStackedInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [
                    {
                        label: '2023',
                        data: data2023,
                        backgroundColor: '#0055A5', // Dunkelblau
                        borderRadius: 4
                    },
                    {
                        label: '2024',
                        data: data2024,
                        backgroundColor: '#00B4D8', // Hellblau
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true },
                    y: { 
                        stacked: true, 
                        beginAtZero: true,
                        title: { display: true, text: 'Anzahl Opfer' }
                    }
                },
                plugins: {
                    legend: { position: 'top' },
                    title: {
                        display: true,
                        text: 'Jahresvergleich der Opferzahlen (Gestapelt)',
                        font: { size: 16 }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Fehler beim Laden des gestapelten Charts:", error);
    }
};