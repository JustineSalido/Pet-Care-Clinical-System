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

  let invoices = [];

  const PREVIEW_COUNT = 4;

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

  const box = document.getElementById("invoiceBox");
  const viewAllBtn = document.getElementById("viewAllBtn");
  let showAll = false;

  function render() {
    box.innerHTML = "";

    const sorted = invoices.slice().sort((a, b) => b.date.localeCompare(a.date));

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

    viewAllBtn.hidden = sorted.length <= PREVIEW_COUNT;
    viewAllBtn.textContent = showAll ? "Show Less" : "View All";
  }

  viewAllBtn.addEventListener("click", () => {
    showAll = !showAll;
    render();
  });

  render();

});