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

    // 2. Colors
    const colorMap = {
        'männlich': '#3498DB',
        'maennlich': '#3498DB',
        'weiblich': '#E91E63',
        'unbekannt': '#95A5A6',
        'divers': '#9B59B6'
    };

    const backgroundColors = labels.map(label => {
        const lowerLabel = label.toLowerCase();
        for (const [key, color] of Object.entries(colorMap)) {
            if (lowerLabel.includes(key)) return color;
        }
        return '#34495E';
    });

    const centerTextPlugin = {
        id: 'centerText',
        afterDraw: function (chart) {
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            const ctx = chart.ctx;

            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // "GESAMT"
            ctx.font = "normal 11px Arial, sans-serif";
            ctx.fillStyle = "#999";
            ctx.fillText("GESAMT", centerX, centerY - 12);

            // Number
            const fontSizeNum = Math.min(chart.chartArea.height / 8, 26);
            ctx.font = "bold " + fontSizeNum + "px Arial, sans-serif";
            ctx.fillStyle = "#2c3e50";

            const textNum = totalCount.toLocaleString('de-DE');
            ctx.fillText(textNum, centerX, centerY + 15);

            ctx.restore();
        }
    };

    // PERMANENT Outside Labels
    const permanentLabelsPlugin = {
        id: 'permanentLabels',
        afterDraw: function (chart) {
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);

            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

            meta.data.forEach((element, index) => {
                const value = chart.data.datasets[0].data[index];

                // Smart Filter: Only draw labels for slices > 1% to prevent overlapping mess
                const percentVal = (value / totalCount);
                if (percentVal < 0.01) return;

                // Prepare Text
                let rawLabel = chart.data.labels[index];
                // Spelling correction
                let displayLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
                if (displayLabel.toLowerCase() === 'maennlich') displayLabel = 'Männlich';

                const percentage = (percentVal * 100).toFixed(1) + '%';
                const labelText = `${displayLabel}: ${value.toLocaleString('de-DE')} (${percentage})`;

                // Calculate Position
                const midAngle = element.startAngle + (element.endAngle - element.startAngle) / 2;

                // Position for the text (Outer Radius + Padding)
                const padding = 25;
                const r = element.outerRadius + padding;
                const x = centerX + Math.cos(midAngle) * r;
                const y = centerY + Math.sin(midAngle) * r;

                // Position for the line start
                const lineStartRadius = element.outerRadius + 4;
                const lineStartX = centerX + Math.cos(midAngle) * lineStartRadius;
                const lineStartY = centerY + Math.sin(midAngle) * lineStartRadius;

                ctx.save();

                // 1. Draw Connecting Line
                ctx.beginPath();
                ctx.moveTo(lineStartX, lineStartY);
                ctx.lineTo(x, y);
                // Line matches slice color for a "Pro" look
                ctx.strokeStyle = chart.data.datasets[0].backgroundColor[index];
                ctx.lineWidth = 2;
                ctx.stroke();

                // 2. Draw Text
                ctx.font = "bold 12px Arial, sans-serif"; // Clean, readable font
                ctx.fillStyle = "#333"; // Dark Grey text
                ctx.textBaseline = "middle";

                // Align text based on Left/Right side of chart
                if (x > centerX) {
                    ctx.textAlign = "left";
                    ctx.fillText(labelText, x + 5, y);
                } else {
                    ctx.textAlign = "right";
                    ctx.fillText(labelText, x - 5, y);
                }

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
                borderColor: '#ffffff',
                hoverOffset: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            layout: {

                padding: {
                    top: 20,
                    bottom: 20,
                    left: 60,
                    right: 60
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 11 },
                        // Clean Legend (Just Names)
                        generateLabels: function (chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const fill = data.datasets[0].backgroundColor[i];
                                    let cleanLabel = label.charAt(0).toUpperCase() + label.slice(1);
                                    if (cleanLabel.toLowerCase() === 'maennlich') cleanLabel = 'Männlich';

                                    return {
                                        text: cleanLabel,
                                        fillStyle: fill,
                                        strokeStyle: fill,
                                        hidden: isNaN(data.datasets[0].data[i]),
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Opferverteilung nach Geschlecht',
                    font: { size: 14, weight: 'bold' },
                    padding: { bottom: 10 }
                },
                // Disable Tooltips
                tooltip: {
                    enabled: false
                }
            }
        },
        plugins: [centerTextPlugin, permanentLabelsPlugin]
    });
}


window.renderGenderChart = renderGenderChart;