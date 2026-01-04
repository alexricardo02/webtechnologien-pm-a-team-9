const renderAgeChart = (chartData) => {
  const ctx = document.getElementById("ageChart");
  if (!ctx) return;

  if (window.ageChartInstance) {
    window.ageChartInstance.destroy();
  }

  // 1. Define Buckets
  let buckets = {
    "Kinder unter 6 Jahren": 0,
    "Kinder 6 bis unter 14 Jahren": 0,
    "Jugendliche 14 bis unter 18 Jahren": 0,
    "Heranwachsende 18 bis unter 21 Jahren": 0,
    "Erwachsene 21 bis unter 60 Jahren": 0,
    "Erwachsene 60 Jahre und älter": 0,
  };

  // 2. Sort Data (Process of Elimination)
  let hasData = false;

  if (chartData && chartData.length > 0) {
    chartData.forEach((item) => {
      // Wichtig: Wir verwenden Kleinbuchstaben, um immer gleich zu vergleichen.
      const str = (item.name || "").toLowerCase();
      const val = parseInt(item.value) || 0;
      if (val > 0) hasData = true;

      // 1. Senioren (60+) - Muss zuerst geprüft werden, um Überschneidungen mit der Gruppe 21-60 zu vermeiden
      if (str.includes('erwachsene 60 jahre und aelter')) {
        buckets['Erwachsene 60 Jahre und älter'] += val;
      }
      // 2. Erwachsene 21-60: Suchen wir nach "erwachsene 21 bis unter 60 jahre"
      else if (str.includes('erwachsene 21 bis unter 60 jahre')) {
        buckets['Erwachsene 21 bis unter 60 Jahren'] += val;
      }
      // 3. Heranwachsende (18-21): Eindeutige Kategorisierung durch Fachbegriff
      else if (str.includes('heranwachsende 18 bis unter 21 jahre')) {
        buckets['Heranwachsende 18 bis unter 21 Jahren'] += val;
      }
      // 4. Jugendliche (14-18): Eindeutige Kategorisierung durch Fachbegriff
      else if (str.includes('jugendliche 14 bis unter 18 jahre')) {
        buckets['Jugendliche 14 bis unter 18 Jahren'] += val;
      }
      // 5. Kinder (6 bis 14): Suche nach der exakten Bezeichnung (inkl. Leerzeichen-Check)
      else if (str.includes('kinder 6  bis unter 14 jahre')) {
        buckets['Kinder 6 bis unter 14 Jahren'] += val;
      }
      // 6. Kinder (<6): Suche nach der Bezeichnung für Kleinkinder
      else if (str.includes('kinder bis unter 6 jahre')) {
        buckets['Kinder unter 6 Jahren'] += val;
      } else {
        console.warn("IGNORED DATA:", str);
      }
    });
  }

  // 3. Fallback: Demo Data
  if (!hasData) {
    console.warn("Age Chart: No data found. Switching to Demo Mode.");
    buckets = {
      "Kinder unter 6 Jahren": 2340,
      "Kinder 6 bis unter 14 Jahren": 5120,
      "Jugendliche 14 bis unter 18 Jahren": 8430,
      "Heranwachsende 18 bis unter 21 Jahren": 7210,
      "Erwachsene 21 bis unter 60 Jahren": 45100,
      "Erwachsene 60 Jahre und älter": 12500,
    };
  }

  // 4. Render
  window.ageChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(buckets),
      datasets: [
        {
          label: "Opferzahl",
          data: Object.values(buckets),
          backgroundColor: [
            "#A3D8EF",
            "#7EBBE0",
            "#599DD1",
            "#347AB8",
            "#0055A5",
            "#002b55",
          ],
          borderRadius: 4,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: hasData
            ? "Opfer nach Altersgruppen"
            : "Opfer nach Altersgruppen (Demo)",
          font: { size: 16 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.raw.toLocaleString()} Opfer`,
          },
        },
      },
      scales: {
        y: { beginAtZero: true },
        x: { grid: { display: false } },
      },
    },
  });
};

window.initAgeChart = renderAgeChart;
