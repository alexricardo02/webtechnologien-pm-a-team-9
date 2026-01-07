window.selectedStraftaten = new Set();
const straftatSelect = document.getElementById("filter-straftat");

straftatSelect.addEventListener("change", function () {
  const value = this.value;

  if (value === "") {// Alle Straftaten
    window.selectedStraftaten.clear();
  } else {
    addStraftat(value);
  }

  this.value = "";

  renderStraftatTags();
  if (window.refreshDashboard) window.refreshDashboard();
});

function addStraftat(crimeValue) {
  window.selectedStraftaten.add(crimeValue);
}

function removeStraftat(crimeValue) {
  window.selectedStraftaten.delete(crimeValue);
  renderStraftatTags();
  if (window.refreshDashboard) window.refreshDashboard();
}

function renderStraftatTags() {
  const container = document.getElementById("selected-straftaten-tags-container");
  if (!container) return;

  container.innerHTML = "";

  window.selectedStraftaten.forEach((crimeValue) => {
    const tag = document.createElement("div");
    tag.className = "landkreis-tag";
    tag.style.backgroundColor = "#e1f5fe"; 
    tag.style.color = "#01579b";

    tag.innerHTML = `
            <span>${crimeValue}</span>
            <button class="remove-btn" 
                    onclick="removeStraftat('${crimeValue}')" 
                    style="background:none; border:none; color:inherit; font:inherit; cursor:pointer; margin-left:5px;">&times;</button>
        `;
    container.appendChild(tag);
  });
}
