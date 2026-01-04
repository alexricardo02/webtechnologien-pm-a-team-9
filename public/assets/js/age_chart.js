const renderAgeChart = (chartData) => {
  const ctx = document.getElementById("ageChart");
  if (!ctx) return;

  if (window.ageChartInstance) {
    window.ageChartInstance.destroy();
  }

  // 1. Define Buckets (Kategorien für das Diagramm)
  let buckets = {
    "Kinder unter 6 Jahren": 0,
    "Kinder 6 bis unter 14 Jahren": 0,
    "Jugendliche 14 bis unter 18 Jahren": 0,
    "Heranwachsende 18 bis unter 21 Jahren": 0,
    "Erwachsene 21 bis unter 60 Jahren": 0,
    "Erwachsene 60 Jahre und älter": 0,
  };

  // 2. Sort Data
  let hasData = false;

  if (chartData && chartData.length > 0) {
    chartData.forEach((item) => {
      // WICHTIG: 
      // 1. toLowerCase(): Alles kleinschreiben
      // 2. replace(/\s+/g, " "): Doppelte Leerzeichen zu einem machen
      // 3. trim(): Leerzeichen am Anfang/Ende entfernen
      const str = (item.name || "").toLowerCase().replace(/\s+/g, " ").trim();
      const val = parseInt(item.value) || 0;

      if (val > 0) hasData = true;

      // Debugging: Falls es immer noch nicht geht, Kommentar entfernen und Konsole prüfen
      // console.log("Gelesener Wert aus DB:", str, "Anzahl:", val);

      // 1. Senioren (60+) - Prüft auf "älter" UND "aelter"
      if (str.includes('60 jahre und aelter') || str.includes('60 jahre und älter')) {
        buckets['Erwachsene 60 Jahre und älter'] += val;
      }
      // 2. Erwachsene 21-60
      else if (str.includes('21 bis unter 60 jahre')) {
        buckets['Erwachsene 21 bis unter 60 Jahren'] += val;
      }
      // 3. Heranwachsende (18-21)
      else if (str.includes('18 bis unter 21 jahre')) {
        buckets['Heranwachsende 18 bis unter 21 Jahren'] += val;
      }
      // 4. Jugendliche (14-18)
      else if (str.includes('14 bis unter 18 jahre')) {
        buckets['Jugendliche 14 bis unter 18 Jahren'] += val;
      }
      // 5. Kinder (6-14) - Erkennt jetzt "6 bis" egal wie viele Leerzeichen dazwischen sind
      else if (str.includes('kinder 6 bis unter 14 jahre')) {
        buckets['Kinder 6 bis unter 14 Jahren'] += val;
      }
      // 6. Kinder (<6) - Erkennt "kinder bis unter 6 jahre" oder "kinder unter 6 jahren"
      else if (str.includes('unter 6 jahre')) {
        buckets['Kinder unter 6 Jahren'] += val;
      } 
      else {
         // Falls Daten da sind, aber nicht zugeordnet werden können:
         // console.warn("Nicht zugeordnete Daten:", str);
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
