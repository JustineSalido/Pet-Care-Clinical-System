document.addEventListener("DOMContentLoaded", () => {

  /* ---------- PHP files (palitan ng pangalan ng sa iyo) ---------- */
  const PHP_GET_PETS   = "../PHP/get_pets.php";
  const PHP_GET_BOOKED = "../PHP/get_booked.php";
  const PHP_BOOK       = "../PHP/book.php";
  const PHP_LOGOUT     = "../PHP/logout.php";

  /* ---------- 1. Logout, dropdown ---------- */
  function logout() {
    window.location.href = PHP_LOGOUT;
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

  document.getElementById("bellBtn").addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });

  /* ---------- 2. Data ---------- */
  const SERVICES = [
    "General Checkup",
    "Vaccination",
    "Dental Cleaning",
    "Deworming",
    "Grooming",
    "Surgery Consultation",
    "Emergency Care"
  ];

  const VETS = ["Dr. Reyes", "Dr. Santos", "Dr. Cruz"];

  // 9:00 AM to 4:30 PM, may lunch break na 12:00 to 1:00 PM
  const SLOTS = [];
  for (let h = 9; h <= 16; h++) {
    [0, 30].forEach(m => {
      if (h === 12) return;
      const hour12 = h > 12 ? h - 12 : h;
      const label = hour12 + ":" + String(m).padStart(2, "0") + (h >= 12 ? " PM" : " AM");
      SLOTS.push({ label: label, mins: h * 60 + m });
    });
  }

  let pets = [];
  let bookedTimes = [];

  /* ---------- 3. State ---------- */
  const state = {
    petId: "",
    service: "",
    vet: "",
    date: "",
    time: "",
    reason: ""
  };

  /* ---------- 4. Helpers ---------- */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function dateKey(y, m, d) {
    return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }

  function prettyDate(key) {
    const parts = key.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function getPet() {
    return pets.find(p => String(p.id) === state.petId);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  /* ---------- 5. Stepper ---------- */
  const STEP_LABELS = ["Pet", "Service", "Veterinarian", "Date & Time", "Reason", "Confirm"];
  const stepper = document.getElementById("stepper");
  let confirmed = false;

  function updateStepper() {
    const done = [
      state.petId !== "",
      state.service !== "",
      state.vet !== "",
      state.date !== "" && state.time !== "",
      state.reason.trim() !== "",
      confirmed
    ];

    const activeIndex = done.indexOf(false);

    stepper.innerHTML = "";
    STEP_LABELS.forEach((label, i) => {
      const li = el("li");
      if (done[i]) li.className = "done";
      else if (i === activeIndex) li.className = "active";

      const circle = el("span", "step-circle", done[i] ? "\u2713" : "");
      li.append(circle, el("span", "", label));
      stepper.appendChild(li);
    });
  }

  /* ---------- 6. Screens ---------- */
  const screens = [
    document.getElementById("screen1"),
    document.getElementById("screen2"),
    document.getElementById("screen3")
  ];

  function showScreen(n) {
    screens.forEach((s, i) => { s.hidden = i !== n - 1; });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- 7. Selects ---------- */
  const selPet = document.getElementById("selPet");
  const selService = document.getElementById("selService");
  const selVet = document.getElementById("selVet");

  function fillSelect(select, placeholder, items) {
    select.innerHTML = "";
    const first = document.createElement("option");
    first.value = "";
    first.textContent = placeholder;
    first.disabled = true;
    first.selected = true;
    select.appendChild(first);

    items.forEach(item => {
      const option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      select.appendChild(option);
    });
  }

  const error1 = document.getElementById("error1");

  function clearError1() {
    error1.textContent = "";
    [selPet, selService, selVet].forEach(s => s.classList.remove("input-error"));
  }

  selPet.addEventListener("change", () => {
    state.petId = selPet.value;
    clearError1();
    updateStepper();
  });

  selService.addEventListener("change", () => {
    state.service = selService.value;
    clearError1();
    updateStepper();
  });

  selVet.addEventListener("change", () => {
    state.vet = selVet.value;
    state.time = "";
    clearError1();
    updateStepper();
  });

  /* ---------- 8. Calendar ---------- */
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calGrid = document.getElementById("calGrid");
  const calTitle = document.getElementById("calTitle");
  const calPrev = document.getElementById("calPrev");
  const calNext = document.getElementById("calNext");

  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();

  function renderCalendar() {
    calTitle.textContent = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });

    calPrev.disabled = viewYear === today.getFullYear() && viewMonth === today.getMonth();

    calGrid.innerHTML = "";
    WEEKDAYS.forEach(d => calGrid.appendChild(el("div", "cal-dow", d)));

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      calGrid.appendChild(el("span"));
    }

    for (let d = 1; d <= totalDays; d++) {
      const key = dateKey(viewYear, viewMonth, d);
      const btn = el("button", "cal-day", String(d));
      btn.type = "button";

      if (new Date(viewYear, viewMonth, d) < today) btn.disabled = true;
      if (key === todayKey) btn.classList.add("today");
      if (key === state.date) btn.classList.add("selected");

      btn.addEventListener("click", () => {
        state.date = key;
        state.time = "";
        clearError1();
        renderCalendar();
        updateStepper();
      });

      calGrid.appendChild(btn);
    }
  }

  calPrev.addEventListener("click", () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });

  calNext.addEventListener("click", () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  /* ---------- 9. Time slots ---------- */
  const slotGrid = document.getElementById("slotGrid");
  const timeNote = document.getElementById("timeNote");
  const reason = document.getElementById("reason");
  const error2 = document.getElementById("error2");

  async function loadBooked() {
    const url = PHP_GET_BOOKED +
      "?vet=" + encodeURIComponent(state.vet) +
      "&date=" + encodeURIComponent(state.date);

    const res = await fetch(url);
    bookedTimes = await res.json();
  }

  function renderSlots() {
    timeNote.textContent = state.vet + " \u2022 " + prettyDate(state.date) +
      "  (Crossed-out times are already taken.)";

    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    slotGrid.innerHTML = "";

    SLOTS.forEach(slot => {
      const btn = el("button", "slot", slot.label);
      btn.type = "button";

      const isPast = state.date === todayKey && slot.mins <= nowMins;
      if (bookedTimes.includes(slot.label) || isPast) btn.disabled = true;
      if (slot.label === state.time) btn.classList.add("selected");

      btn.addEventListener("click", () => {
        state.time = slot.label;
        error2.textContent = "";
        renderSlots();
        updateStepper();
      });

      slotGrid.appendChild(btn);
    });
  }

  reason.addEventListener("input", () => {
    state.reason = reason.value;
    reason.classList.remove("input-error");
    error2.textContent = "";
    updateStepper();
  });

  document.getElementById("backTo1").addEventListener("click", () => showScreen(1));

  /* ---------- 10. Screen 1 -> Screen 2 ---------- */
  document.getElementById("toTime").addEventListener("click", async () => {
    clearError1();

    if (state.petId === "") {
      selPet.classList.add("input-error");
      error1.textContent = "Please select your pet.";
      return;
    }
    if (state.service === "") {
      selService.classList.add("input-error");
      error1.textContent = "Please select a service.";
      return;
    }
    if (state.vet === "") {
      selVet.classList.add("input-error");
      error1.textContent = "Please select a veterinarian.";
      return;
    }
    if (state.date === "") {
      error1.textContent = "Please pick a date on the calendar.";
      return;
    }

    try {
      await loadBooked();
    } catch (err) {
      error1.textContent = "Could not load the available times.";
      return;
    }

    renderSlots();
    showScreen(2);
  });

  /* ---------- 11. Screen 2 -> Screen 3 ---------- */
  const summary = document.getElementById("summary");

  document.getElementById("toConfirm").addEventListener("click", () => {
    error2.textContent = "";
    reason.classList.remove("input-error");

    if (state.time === "") {
      error2.textContent = "Please choose a time.";
      return;
    }

    if (state.reason.trim().length < 3) {
      reason.classList.add("input-error");
      error2.textContent = "Please tell us the reason for the visit.";
      reason.focus();
      return;
    }

    const pet = getPet();
    const rows = [
      ["Pet", pet.name + " (" + pet.breed + ")"],
      ["Service", state.service],
      ["Veterinarian", state.vet],
      ["Date", prettyDate(state.date)],
      ["Time", state.time],
      ["Reason", state.reason.trim()]
    ];

    summary.innerHTML = "";
    rows.forEach(r => {
      const row = el("div", "summary-row");
      row.append(el("span", "", r[0]), el("span", "", r[1]));
      summary.appendChild(row);
    });

    showScreen(3);
  });

  document.getElementById("backTo2").addEventListener("click", () => showScreen(2));

  /* ---------- 12. Confirm booking ---------- */
  const error3 = document.getElementById("error3");
  const confirmBtn = document.getElementById("confirmBtn");

  confirmBtn.addEventListener("click", async () => {
    error3.className = "book-error";
    error3.textContent = "";
    confirmBtn.disabled = true;

    try {
      const res = await fetch(PHP_BOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet_id: state.petId,
          service: state.service,
          vet: state.vet,
          date: state.date,
          time: state.time,
          reason: state.reason.trim()
        })
      });

      const result = await res.json();

      if (!result.success) {
        error3.textContent = result.message || "Could not book the appointment.";
        confirmBtn.disabled = false;
        return;
      }

      confirmed = true;
      updateStepper();

      error3.className = "book-error success";
      error3.textContent = "Appointment booked! Redirecting to your dashboard...";

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1800);

    } catch (err) {
      error3.textContent = "Cannot reach the server. Please try again.";
      confirmBtn.disabled = false;
    }
  });

  /* ---------- Start ---------- */
  async function start() {
    renderCalendar();
    updateStepper();
    showScreen(1);

    fillSelect(selService, "Choose a service", SERVICES.map(s => ({ value: s, label: s })));
    fillSelect(selVet, "Choose a veterinarian", VETS.map(v => ({ value: v, label: v })));

    try {
      const res = await fetch(PHP_GET_PETS);
      pets = await res.json();
    } catch (err) {
      error1.textContent = "Could not load your pets.";
    }

    fillSelect(selPet, "Choose your pet", pets.map(p => ({
      value: String(p.id),
      label: p.name + " (" + p.breed + ")"
    })));
  }

  start();

});