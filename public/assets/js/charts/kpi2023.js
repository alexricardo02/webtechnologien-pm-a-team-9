window.updateKPI2023 = function(data) {
    let total2023 = 0;

    data.forEach(item => {
        if (String(item.jahr) === '2023') {
            total2023 += parseInt(item.value || 0);
        }
    });

    const display = document.getElementById('val-2023'); 
    if (display) {
        display.innerText = total2023.toLocaleString('de-DE');
    }
};

