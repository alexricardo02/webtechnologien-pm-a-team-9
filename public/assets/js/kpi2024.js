window.updateKPI2024 = function(data) {
    let total2024 = 0;

    data.forEach(item => {
        if (String(item.jahr) === '2024') {
            total2024 += parseInt(item.value || 0);
        }
    });

    const display = document.getElementById('val-2024'); // ID definido en dashboard.php
    if (display) {
        display.innerText = total2024.toLocaleString('de-DE');
    }
};