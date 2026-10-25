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

  let appointments = [];

  function prettyDate(key) {
    const parts = String(key).split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return key;
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function tabOf(appt) {
    const status = String(appt.status || "").toLowerCase();
    if (status === "cancelled") return "cancelled";
    if (status === "completed") return "completed";
    return "upcoming";
  }

  const list = document.getElementById("apptList");
  const tabButtons = document.querySelectorAll(".tab");
  let activeTab = "upcoming";

  const EMPTY_TEXT = {
    upcoming: "You have no upcoming appointments.",
    completed: "No completed appointments yet.",
    cancelled: "No cancelled appointments."
  };

  function renderList() {
    list.innerHTML = "";

    const items = appointments.filter(a => tabOf(a) === activeTab);

    if (items.length === 0) {
      const empty = el("div", "empty-state");
      empty.append(EMPTY_TEXT[activeTab]);

      if (activeTab === "upcoming") {
        empty.append(" ");
        const link = el("a", "", "Book one now");
        link.href = "book.html";
        empty.appendChild(link);
      }

      list.appendChild(empty);
      return;
    }

    items.forEach(appt => {
      const card = el("article", "appt-card");

      const pet = el("div", "appt-pet");
      const avatar = el("div", "appt-avatar", "PET");

      const name = el("div", "appt-name");
      name.append(appt.petName || "Pet", document.createElement("br"), appt.service || "Service");
      pet.append(avatar, name);

      const when = el("div", "appt-when");
      when.append(prettyDate(appt.date) + " \u2022 " + appt.time, document.createElement("br"), appt.vet || "Vet");

      if (activeTab !== "upcoming") {
        const badge = el("span", "appt-status " + activeTab,
          activeTab === "completed" ? "Completed" : "Cancelled");
        when.append(document.createElement("br"), badge);
      }

      card.append(pet, when);

      if (activeTab === "upcoming") {
        const actions = el("div", "appt-actions");

        const resBtn = el("button", "btn-reschedule", "Reschedule");
        resBtn.type = "button";
        resBtn.addEventListener("click", () => openReschedule(appt));

        const canBtn = el("button", "btn-cancel", "Cancel");
        canBtn.type = "button";
        canBtn.addEventListener("click", () => {
          const ok = confirm("Cancel this appointment?");
          if (ok) {
            appt.status = "Cancelled";
            renderList();
          }
        });

        actions.append(resBtn, canBtn);
        card.appendChild(actions);
      }

      list.appendChild(card);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      activeTab = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.toggle("active", b === btn));
      renderList();
    });
  });

  renderList();

  const SLOTS = [];
  for (let h = 9; h <= 16; h++) {
    [0, 30].forEach(m => {
      if (h === 12) return;
      const hour12 = h > 12 ? h - 12 : h;
      SLOTS.push(hour12 + ":" + String(m).padStart(2, "0") + (h >= 12 ? " PM" : " AM"));
    });
  }

  const overlay = el("div", "modal-overlay");
  overlay.innerHTML = `
    <div class="modal">
      <button type="button" class="modal-close" aria-label="Close">&times;</button>
      <h2>Reschedule</h2>
      <p class="resched-note" id="reschedNote"></p>
      <form id="reschedForm" novalidate>
        <label for="reschedDate">New date</label>
        <input type="date" id="reschedDate">
        <label for="reschedTime">New time</label>
        <select id="reschedTime"></select>
        <p class="modal-error" id="reschedError"></p>
        <button type="submit" class="modal-submit">Save New Schedule</button>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  const reschedForm = overlay.querySelector("#reschedForm");
  const reschedNote = overlay.querySelector("#reschedNote");
  const reschedDate = overlay.querySelector("#reschedDate");
  const reschedTime = overlay.querySelector("#reschedTime");
  const reschedError = overlay.querySelector("#reschedError");

  const now = new Date();
  reschedDate.min = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

  SLOTS.forEach(label => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    reschedTime.appendChild(option);
  });

  let reschedulingAppt = null;

  function openReschedule(appt) {
    reschedulingAppt = appt;
    reschedNote.textContent = (appt.petName || "Pet") + " \u2022 " + (appt.service || "Service");
    reschedDate.value = appt.date || "";
    reschedTime.value = SLOTS.includes(appt.time) ? appt.time : SLOTS[0];
    reschedError.textContent = "";
    reschedDate.classList.remove("input-error");

    overlay.classList.add("open");
    reschedDate.focus();
  }

  function closeReschedule() {
    overlay.classList.remove("open");
  }

  overlay.querySelector(".modal-close").addEventListener("click", closeReschedule);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeReschedule();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeReschedule();
  });

  reschedDate.addEventListener("input", () => {
    reschedDate.classList.remove("input-error");
    reschedError.textContent = "";
  });

  reschedForm.addEventListener("submit", (e) => {
    e.preventDefault();
    reschedError.textContent = "";
    reschedDate.classList.remove("input-error");

    if (reschedDate.value === "") {
      reschedDate.classList.add("input-error");
      reschedError.textContent = "Please choose a new date.";
      return;
    }

    if (reschedDate.value < reschedDate.min) {
      reschedDate.classList.add("input-error");
      reschedError.textContent = "You can't choose a past date.";
      return;
    }

    if (reschedulingAppt && reschedDate.value === reschedulingAppt.date && reschedTime.value === reschedulingAppt.time) {
      reschedError.textContent = "Please choose a different date or time.";
      return;
    }

    if (reschedulingAppt) {
      reschedulingAppt.date = reschedDate.value;
      reschedulingAppt.time = reschedTime.value;
    }

    closeReschedule();
    renderList();
  });

});