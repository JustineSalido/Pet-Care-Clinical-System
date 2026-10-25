document.addEventListener("DOMContentLoaded", () => {

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function logout() {
    fetch("../PHP/logout.php", { method: "POST", credentials: "same-origin" })
      .finally(() => { window.location.href = "login.html"; });
  }

  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("menuLogout").addEventListener("click", logout);

  const userBtn = document.getElementById("userBtn");
  const userMenu = document.getElementById("userMenu");

  userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.classList.toggle("open");
  });
  
  document.addEventListener("click", () => userMenu.classList.remove("open"));

  document.querySelectorAll(".nav a").forEach(link => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href") === "#") e.preventDefault();
    });
  });

  const bellBadge = document.getElementById("bellBadge");
  bellBadge.classList.toggle("hidden", bellBadge.textContent.trim() === "0");

  document.getElementById("bellBtn").addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });

  const records = {};

  const TABS = {
    vaccinations: {
      title: "Vaccination Records",
      columns: [["Date", "date", "date"], ["Vaccine", "vaccine"], ["Next Due", "nextDue", "date"], ["Status", "status", "status"]]
    },
    diagnoses: {
      title: "Diagnoses",
      columns: [["Date", "date", "date"], ["Diagnosis", "diagnosis"], ["Veterinarian", "vet"]]
    },
    treatments: {
      title: "Treatments",
      columns: [["Date", "date", "date"], ["Treatment", "treatment"], ["Veterinarian", "vet"], ["Status", "status", "status"]]
    },
    prescriptions: {
      title: "Prescriptions",
      columns: [["Date", "date", "date"], ["Medication", "medication"], ["Dosage", "dosage"], ["Duration", "duration"]]
    }
  };

  const HISTORY_COLUMNS = [["Date", "date", "date"], ["Condition", "condition"], ["Outcome", "outcome"]];

  function prettyDate(key) {
    const parts = String(key).split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return key;
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function badgeClass(status) {
    const s = String(status).toLowerCase();
    if (s === "completed") return "completed";
    if (s === "ongoing") return "ongoing";
    return "due";
  }

  function renderTable(box, columns, rows, showHead) {
    box.innerHTML = "";

    if (!rows || rows.length === 0) {
      box.appendChild(el("p", "empty-note", "No records yet."));
      return;
    }

    const table = el("table", "rec-table");

    if (showHead) {
      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");
      columns.forEach(col => headRow.appendChild(el("th", "", col[0])));
      thead.appendChild(headRow);
      table.appendChild(thead);
    }

    const tbody = document.createElement("tbody");
    rows.forEach(row => {
      const tr = document.createElement("tr");

      columns.forEach(col => {
        const value = row[col[1]];
        const td = document.createElement("td");

        if (col[2] === "date") {
          td.textContent = prettyDate(value);
        } else if (col[2] === "status") {
          td.appendChild(el("span", "badge " + badgeClass(value), value));
        } else {
          td.textContent = value;
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    box.appendChild(table);
  }

  const petSelect = document.getElementById("petSelect");
  const recordsTitle = document.getElementById("recordsTitle");
  const recordsBox = document.getElementById("recordsBox");
  const historyBox = document.getElementById("historyBox");
  const tabButtons = document.querySelectorAll(".tab");

  let activePet = null;
  let activeTab = "vaccinations";

  function render() {
    const tab = TABS[activeTab];
    recordsTitle.textContent = tab.title;

    if (!activePet || !records[activePet]) {
      renderTable(recordsBox, tab.columns, [], true);
      renderTable(historyBox, HISTORY_COLUMNS, [], false);
      return;
    }

    const data = records[activePet];
    renderTable(recordsBox, tab.columns, data[activeTab], true);
    renderTable(historyBox, HISTORY_COLUMNS, data.history, false);
  }

  petSelect.addEventListener("change", () => {
    activePet = petSelect.value;
    render();
  });

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      activeTab = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.toggle("active", b === btn));
      render();
    });
  });

  render();

});