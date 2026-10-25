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

  document.getElementById("bellBtn").addEventListener("click", () => {
    window.location.href = "notifications.html";
  });

  const notifications = [];

  const bellBadge = document.getElementById("bellBadge");

  function updateBell() {
    const unread = notifications.filter(n => n.unread).length;
    bellBadge.textContent = unread;
    bellBadge.classList.toggle("hidden", unread === 0);
  }

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