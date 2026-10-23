document.addEventListener("DOMContentLoaded", () => {

  function logout() {
    window.location.href = "login.html";
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

  const records = {
    Bella: {
      vaccinations: [
        { date: "2024-01-10", vaccine: "Rabies", nextDue: "2025-01-10", status: "Completed" },
        { date: "2024-02-15", vaccine: "DHPP", nextDue: "2025-02-15", status: "Completed" },
        { date: "2024-03-20", vaccine: "Bordetella", nextDue: "2025-03-20", status: "Completed" }
      ],
      diagnoses: [
        { date: "2025-04-12", diagnosis: "Mild gastritis", vet: "Dr. Reyes" },
        { date: "2025-04-30", diagnosis: "Healthy (routine checkup)", vet: "Dr. Reyes" }
      ],
      treatments: [
        { date: "2025-04-12", treatment: "Anti-nausea medication", vet: "Dr. Reyes", status: "Completed" },
        { date: "2025-04-30", treatment: "Routine checkup", vet: "Dr. Reyes", status: "Completed" }
      ],
      prescriptions: [
        { date: "2025-04-12", medication: "Anti-nausea medication", dosage: "1 tablet once a day", duration: "3 days" }
      ],
      history: [
        { date: "2025-04-12", condition: "Vomiting", outcome: "Treated with anti-nausea medication" },
        { date: "2025-04-30", condition: "Routine Checkup", outcome: "Healthy" }
      ]
    },
    Luna: {
      vaccinations: [
        { date: "2024-06-12", vaccine: "Rabies", nextDue: "2025-06-12", status: "Completed" },
        { date: "2024-07-10", vaccine: "FVRCP", nextDue: "2025-07-10", status: "Due" }
      ],
      diagnoses: [
        { date: "2025-03-02", diagnosis: "Mild eye irritation", vet: "Dr. Santos" }
      ],
      treatments: [
        { date: "2025-03-02", treatment: "Eye drops", vet: "Dr. Santos", status: "Ongoing" }
      ],
      prescriptions: [
        { date: "2025-03-02", medication: "Eye drops", dosage: "1 drop in each eye, twice a day", duration: "7 days" }
      ],
      history: [
        { date: "2025-03-02", condition: "Eye discharge", outcome: "Treated with eye drops" }
      ]
    }
  };

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

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

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

    if (rows.length === 0) {
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

  let activePet = Object.keys(records)[0];
  let activeTab = "vaccinations";

  Object.keys(records).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    petSelect.appendChild(option);
  });

  function render() {
    const data = records[activePet];
    const tab = TABS[activeTab];

    recordsTitle.textContent = tab.title;
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