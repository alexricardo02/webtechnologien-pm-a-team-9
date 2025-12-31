const renderGenderChart = (chartData) => {
    const ctx = document.getElementById('genderChart');
    if (!ctx) return;

    if (window.genderChartInstance) {
        window.genderChartInstance.destroy();
    }

    const genderSums = {};
    let totalCount = 0;

    chartData.forEach(item => {
        let gender = item.name;
        if (!genderSums[gender]) genderSums[gender] = 0;
        genderSums[gender] += item.value;
        totalCount += item.value;
    });

    const labels = Object.keys(genderSums);
    const dataValues = Object.values(genderSums);

    const colorMap = {
        'männlich': '#3498DB', 'maennlich': '#3498DB',
        'weiblich': '#E91E63', 'unbekannt': '#95A5A6', 'divers': '#9B59B6'
    };

    const backgroundColors = labels.map(label => {
        const lowerLabel = label.toLowerCase();
        for (const [key, color] of Object.entries(colorMap)) {
            if (lowerLabel.includes(key)) return color;
        }
        return '#34495E';
    });

    // PLUGIN: Texto Central Escalable
    const centerTextPlugin = {
        id: 'centerText',
        afterDraw: function(chart) {
            const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;
            const centerX = (left + right) / 2;
            const centerY = (top + bottom) / 2;

            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // "GESAMT" (Escala con el alto)
            const fontSizeLabel = Math.max(height / 25, 10);
            ctx.font = `normal ${fontSizeLabel}px Arial, sans-serif`;
            ctx.fillStyle = "#999";
            ctx.fillText("GESAMT", centerX, centerY - (fontSizeLabel * 0.8));

            // Número (Escala con el alto)
            const fontSizeNum = Math.max(height / 12, 16);
            ctx.font = `bold ${fontSizeNum}px Arial, sans-serif`;
            ctx.fillStyle = "#2c3e50";
            const textNum = totalCount.toLocaleString('de-DE');
            ctx.fillText(textNum, centerX, centerY + (fontSizeNum * 0.5));
            
            ctx.restore();
        }
    };

    // PLUGIN: Etiquetas Externas Inteligentes
    const permanentLabelsPlugin = {
        id: 'permanentLabels',
        afterDraw: function(chart) {
            // Si el gráfico es muy pequeño (móvil), no dibujamos etiquetas externas
            // para evitar colisiones
            if (chart.width < 380) return; 

            const { ctx, chartArea: { left, right, top, bottom } } = chart;
            const meta = chart.getDatasetMeta(0);
            const centerX = (left + right) / 2;
            const centerY = (top + bottom) / 2;

            meta.data.forEach((element, index) => {
                const value = chart.data.datasets[0].data[index];
                const percentVal = (value / totalCount);
                if (percentVal < 0.02) return; // Ignorar porciones menores al 2%

                const midAngle = element.startAngle + (element.endAngle - element.startAngle) / 2;
                const padding = 20; 
                const r = element.outerRadius + padding;
                const x = centerX + Math.cos(midAngle) * r;
                const y = centerY + Math.sin(midAngle) * r;

                const lineStartRadius = element.outerRadius + 2;
                const lineStartX = centerX + Math.cos(midAngle) * lineStartRadius;
                const lineStartY = centerY + Math.sin(midAngle) * lineStartRadius;

                ctx.save();
                // Línea de conexión
                ctx.beginPath();
                ctx.moveTo(lineStartX, lineStartY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = chart.data.datasets[0].backgroundColor[index];
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Texto
                const percentage = (percentVal * 100).toFixed(1) + '%';
                ctx.font = "bold 11px Arial, sans-serif";
                ctx.fillStyle = "#333";
                ctx.textBaseline = "middle";
                ctx.textAlign = x > centerX ? "left" : "right";
                ctx.fillText(percentage, x > centerX ? x + 5 : x - 5, y);
                ctx.restore();
            });
        }
    };

    window.genderChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            layout: {
                // Aumentamos padding lateral para dar espacio a las líneas
                padding: { top: 10, bottom: 10, left: 45, right: 45 }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12 },
                        // Enriquecemos la leyenda con valores por si las etiquetas externas se ocultan
                        generateLabels: (chart) => {
                            const data = chart.data;
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const perc = ((value / totalCount) * 100).toFixed(1);
                                let cleanLabel = label.charAt(0).toUpperCase() + label.slice(1);
                                if(cleanLabel.toLowerCase() === 'maennlich') cleanLabel = 'Männlich';
                                
                                return {
                                    text: `${cleanLabel}: ${perc}%`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    index: i
                                };
                            });
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Opferverteilung nach Geschlecht',
                    font: { size: 15, weight: 'bold' }
                },
                tooltip: {
                    enabled: true // Habilitar tooltips como respaldo en móvil
                }
            }
        },
        plugins: [centerTextPlugin, permanentLabelsPlugin]
    });
}


window.renderGenderChart = renderGenderChart;