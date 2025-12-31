window.selectedLandkreise = new Set();

let names = [];

async function setupSearch() {
  await DataManager.initGeo();
  names = DataManager.getLandkreisNames();
  const datalist = document.getElementById("landkreis-list");
  datalist.innerHTML = names.map((n) => `<option value="${n}">`).join("");
}
setupSearch();

const searchInput = document.getElementById("search-landkreis");

searchInput.addEventListener("input", function () {
  const val = this.value.trim();
  const errorMsg = document.getElementById("search-error");

  if (val === "") {
    errorMsg.style.display = "none";
    return;
  }

  if (names.includes(val)) {
    addLandkreis(val);
    this.value = "";
  } else {
    const hasPotentialMatch = names.some((n) =>
      n.toLowerCase().startsWith(val.toLowerCase())
    );

    if (hasPotentialMatch) {
      errorMsg.style.display = "none";
    } else {
      errorMsg.innerHTML = "Landkreis nicht gefunden";
      errorMsg.style.display = "block";
    }
  }
});

function addLandkreis(name) {
  const errorMsg = document.getElementById("search-error");
  if (selectedLandkreise.size >= 10 && !selectedLandkreise.has(name)) {
    errorMsg.innerHTML = "Max. 10 Landkreise erlaubt";
    errorMsg.style.display = "block";
    return;
  }
  errorMsg.style.display = "none";

  selectedLandkreise.add(name);
  renderTags();

  if (window.refreshDashboard) window.refreshDashboard();
}

function renderTags() {
  const container = document.getElementById("selected-tags-container");
  if (!container) return;

  container.innerHTML = "";

  selectedLandkreise.forEach((name) => {
    const tag = document.createElement("div");
    tag.className = "landkreis-tag";
    tag.innerHTML = `
    <span>${name}</span>
    <button class="remove-btn" 
            onclick="removeLandkreis('${name}')" 
            style="background:none; border:none; color:inherit; font:inherit;">&times;</button>
`;
    container.appendChild(tag);
  });
}

function removeLandkreis(name) {
  const errorMsg = document.getElementById("search-error");
  selectedLandkreise.delete(name);
  if (selectedLandkreise.size < 10) errorMsg.style.display = "none";
  renderTags();
  if (window.refreshDashboard) window.refreshDashboard();
}
