window.selectedLandkreise = new Set();

let names = [];

/**
 * Sets up the search input field and populates the datalist with all unique Landkreis names.
 */
async function setupSearch() {
  await dataManager.initGeo();
  
  names = dataManager.getLandkreisNames();
  
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

/**
 * Adds a Landkreis to the currently selected ones.
 * If the maximum amount of 10 Landkreise is already reached, an error message is displayed.
 */
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

  if (window.refreshDashboard) window.refreshDashboard(); // Notify dashboard to refresh data
}

/**
 * Renders all currently selected Landkreise as tags in the DOM.
 */
function renderTags() {
  const container = document.getElementById("selected-tags-container");
  if (!container) return;

  container.innerHTML = "";

  selectedLandkreise.forEach((name) => {
    const tag = document.createElement("div");
    tag.className = "landkreis-tag";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = name;

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.onclick = () => removeLandkreis(name);
    removeBtn.textContent = "&times;";

    tag.appendChild(nameSpan);
    tag.appendChild(removeBtn);

    container.appendChild(tag);
  });
}

/**
 * Removes a Landkreis from the selection.
 */
function removeLandkreis(name) {
  const errorMsg = document.getElementById("search-error");
  selectedLandkreise.delete(name);

  if (selectedLandkreise.size < 10) {
    errorMsg.style.display = "none";
  }

  renderTags();

  if (window.refreshDashboard) {
    window.refreshDashboard();
  }
}
