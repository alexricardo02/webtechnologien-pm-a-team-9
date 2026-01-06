const renderAgeChart = (chartData) => {
  const ctx = document.getElementById("ageChart");
  if (!ctx) return;

  if (window.ageChartInstance) {
    window.ageChartInstance.destroy();
  }

  // 1. Define Buckets (Kategorien für das Diagramm)
  let buckets = {
    "0 bis 6 Jahren": 0,
    "6 bis 14 Jahren": 0,
    "14 bis 18 Jahren": 0,
    "18 bis 21 Jahren": 0,
    "21 bis 60 Jahren": 0,
    "60 Jahre und älter": 0,
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
      if (
        str.includes("60 jahre und aelter") ||
        str.includes("60 jahre und älter")
      ) {
        buckets["60 Jahre und älter"] += val;
      }
      // 2. Erwachsene 21-60
      else if (str.includes("21 bis unter 60 jahre")) {
        buckets["21 bis 60 Jahren"] += val;
      }
      // 3. Heranwachsende (18-21)
      else if (str.includes("18 bis unter 21 jahre")) {
        buckets["18 bis 21 Jahren"] += val;
      }
      // 4. Jugendliche (14-18)
      else if (str.includes("14 bis unter 18 jahre")) {
        buckets["14 bis 18 Jahren"] += val;
      }
      // 5. Kinder (6-14) - Erkennt jetzt "6 bis" egal wie viele Leerzeichen dazwischen sind
      else if (str.includes("kinder 6 bis unter 14 jahre")) {
        buckets["6 bis 14 Jahren"] += val;
      }
      // 6. Kinder (<6) - Erkennt "kinder bis unter 6 jahre" oder "kinder unter 6 jahren"
      else if (str.includes("unter 6 jahre")) {
        buckets["0 bis 6 Jahren"] += val;
      } else {
        // Falls Daten da sind, aber nicht zugeordnet werden können:
        // console.warn("Nicht zugeordnete Daten:", str);
      }
    });
  }

  totalSum = Object.values(buckets).reduce((a, b) => a + b, 0);

  const ageLabelsPlugin = {
    id: "ageLabelsPlugin",
    afterDraw: function (chart) {
      const ctx = chart.ctx;
      const meta = chart.getDatasetMeta(0);
      const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
      const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

      meta.data.forEach((element, index) => {
        const value = chart.data.datasets[0].data[index];
        if (value === 0) return;

        const percentVal = value / totalSum;
        if (percentVal < 0.02) return;

        const percentage = (percentVal * 100).toFixed(1) + "%";
        const midAngle =
          element.startAngle + (element.endAngle - element.startAngle) / 2;

        const padding = 20;
        const r = element.outerRadius + padding;
        const x = centerX + Math.cos(midAngle) * r;
        const y = centerY + Math.sin(midAngle) * r;

        const lineStartRadius = element.outerRadius + 2;
        const lineStartX = centerX + Math.cos(midAngle) * lineStartRadius;
        const lineStartY = centerY + Math.sin(midAngle) * lineStartRadius;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(lineStartX, lineStartY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = chart.data.datasets[0].backgroundColor[index];
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = "bold 11px Arial, sans-serif";
        ctx.fillStyle = "#333";
        ctx.textBaseline = "middle";
        ctx.textAlign = x > centerX ? "left" : "right";
        ctx.fillText(percentage, x > centerX ? x + 5 : x - 5, y);
        ctx.restore();
      });
    },
  };

  // 4. Render
  window.ageChartInstance = new Chart(ctx, {
    type: "doughnut",
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
          borderWidth: 2,
          hoverOffset: 15,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      layout: {
        padding: { top: 20, bottom: 20, left: 60, right: 140 },
      },
      plugins: {
        legend: {
          display: true, // Legende ist bei Doughnuts wichtig
          position: "right",
          align: "center",
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {size: 12}
          },
        },
        title: {
          display: true,
          text: hasData
            ? "Opfer nach Altersgruppen"
            : "Opfer nach Altersgruppen (Demo)",
          font: { size: 16, weight: "bold" },
          padding: {
                top: 10,    
                bottom: 40  
            }
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.label}: ${ctx.raw.toLocaleString("de-DE")} Opfer`,
          },
        },
      },
    },
    plugins: [ageLabelsPlugin],
  });
};

window.initAgeChart = renderAgeChart;
