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

  document.getElementById("bellBtn").addEventListener("click", () => {
    window.location.href = "notifications.html";
  });

  /* ---------- 2. Sample data (palitan o dagdagan) ---------- */
  // type: "info" (asul na tuldok) o "alert" (pulang tuldok)
  const notifications = [
    { id: 1, type: "info",  title: "Appointment confirmed", text: "Your appointment is confirmed for May 15, 2025.", time: "2h ago", unread: true },
    { id: 2, type: "info",  title: "Reminder",              text: "Vaccination reminder for Luna.",                  time: "1d ago", unread: true },
    { id: 3, type: "info",  title: "Message from Vet",      text: "You have a new message from Dr. Reyes.",          time: "2d ago", unread: true },
    { id: 4, type: "alert", title: "Clinic Announcement",   text: "We will be closed on May 30.",                    time: "3d ago", unread: true }
  ];

  /* ---------- 3. Helpers ---------- */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const bellBadge = document.getElementById("bellBadge");

  function updateBell() {
    const unread = notifications.filter(n => n.unread).length;
    bellBadge.textContent = unread;
    bellBadge.classList.toggle("hidden", unread === 0);
  }

  /* ---------- 4. Render ---------- */
  const list = document.getElementById("notifList");

  function render() {
    list.innerHTML = "";

    if (notifications.length === 0) {
      list.appendChild(el("div", "n-empty", "You're all caught up."));
      updateBell();
      return;
    }

    notifications.forEach(n => {
      let classes = "n-card " + n.type;
      if (!n.unread) classes += " read";

      const card = el("button", classes);
      card.type = "button";
      card.title = n.unread ? "Click to mark as read" : "";

      const body = el("span");
      body.append(el("span", "n-title", n.title), el("span", "n-text", n.text));

      card.append(el("span", "n-dot"), body, el("span", "n-time", n.time));

      card.addEventListener("click", () => {
        if (!n.unread) return;
        n.unread = false;
        render();
      });

      list.appendChild(card);
    });

    updateBell();
  }

  render();

});