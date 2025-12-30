let selectedLandkreise = new Set();


async function setupSearch() {
    await DataManager.initGeo(); 
    const names = DataManager.getLandkreisNames();
    const datalist = document.getElementById('landkreis-list');
    datalist.innerHTML = names.map(n => `<option value="${n}">`).join('');
}

