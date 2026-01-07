window.selectedAltersgruppen = new Set();

const altersgruppeSelect = document.getElementById("filter-altersgruppe");

altersgruppeSelect.addEventListener("change", function () {
  const value = this.value;

  if (value === "") {// Alle Altersgruppen
    window.selectedAltersgruppen.clear();
  } else {
    addAltersgruppe(value);
  }

  this.value = "";

  renderAltersgruppeTags();
  if (window.refreshDashboard) window.refreshDashboard();
});

function addAltersgruppe(crimeValue) {
  window.selectedAltersgruppen.add(crimeValue);
}

function removeAltersgruppe(crimeValue) {
  window.selectedAltersgruppen.delete(crimeValue);
  renderAltersgruppeTags();
  if (window.refreshDashboard) window.refreshDashboard();
}

function renderAltersgruppeTags() {
  const container = document.getElementById("selected-altersgruppen-tags-container");
  if (!container) return;

  container.innerHTML = "";

  window.selectedAltersgruppen.forEach((crimeValue) => {
    const tag = document.createElement("div");
    tag.className = "landkreis-tag";
    tag.style.backgroundColor = "#e1f5fe"; 
    tag.style.color = "#01919bff";

    tag.innerHTML = `
            <span>${crimeValue}</span>
            <button class="remove-btn" 
                    onclick="removeAltersgruppe('${crimeValue}')" 
                    style="background:none; border:none; color:inherit; font:inherit; cursor:pointer; margin-left:5px;">&times;</button>
        `;
    container.appendChild(tag);
  });
}
