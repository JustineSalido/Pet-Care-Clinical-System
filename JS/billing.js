document.addEventListener("DOMContentLoaded", () => {

  /* ---------- 1. Logout, dropdown, bell ---------- */
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

  /* ---------- 2. Sample data (palitan o dagdagan) ---------- */
  // status: "Paid" o "Pending"
  const invoices = [
    { date: "2025-05-15", description: "General Checkup (Bella)", amount: 1000, status: "Pending" },
    { date: "2025-04-28", description: "Vaccination (Luna)",      amount: 800,  status: "Paid" },
    { date: "2025-04-20", description: "Consultation (Bella)",    amount: 600,  status: "Paid" },
    { date: "2025-02-12", description: "Grooming (Luna)",         amount: 1200, status: "Paid" },
    { date: "2025-01-10", description: "Rabies Vaccine (Bella)",  amount: 700,  status: "Paid" },
    { date: "2024-12-05", description: "Dental Cleaning (Luna)",  amount: 1500, status: "Paid" }
  ];

  // Ilan lang ang ipapakita bago pindutin ang View All
  const PREVIEW_COUNT = 4;

  /* ---------- 3. Helpers ---------- */
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

  function peso(amount) {
    return "\u20B1" + Number(amount).toLocaleString("en-US");
  }

  /* ---------- 4. Render ---------- */
  const box = document.getElementById("invoiceBox");
  const viewAllBtn = document.getElementById("viewAllBtn");
  let showAll = false;

  // Pinakabago ang nasa taas
  const sorted = invoices.slice().sort((a, b) => b.date.localeCompare(a.date));

  function render() {
    box.innerHTML = "";

    if (sorted.length === 0) {
      box.appendChild(el("p", "empty-note", "No invoices yet."));
      viewAllBtn.hidden = true;
      return;
    }

    const rows = showAll ? sorted : sorted.slice(0, PREVIEW_COUNT);

    const table = el("table", "invoice-table");

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    [["Date", ""], ["Description", ""], ["Amount", "amount"], ["Status", ""]].forEach(col => {
      headRow.appendChild(el("th", col[1], col[0]));
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    rows.forEach(inv => {
      const tr = document.createElement("tr");

      const statusTd = document.createElement("td");
      statusTd.appendChild(el("span", "badge " + inv.status.toLowerCase(), inv.status));

      tr.append(
        el("td", "", prettyDate(inv.date)),
        el("td", "", inv.description),
        el("td", "amount", peso(inv.amount)),
        statusTd
      );
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    box.appendChild(table);

    // Itago ang button kung wala nang dagdag na ipapakita
    viewAllBtn.hidden = sorted.length <= PREVIEW_COUNT;
    viewAllBtn.textContent = showAll ? "Show Less" : "View All";
  }

  viewAllBtn.addEventListener("click", () => {
    showAll = !showAll;
    render();
  });

  render();

});