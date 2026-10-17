document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Settings ---------- */
  // Gawing true kung gusto mong kailangan munang mag-login bago makita ang dashboard
  const REQUIRE_LOGIN = false;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (REQUIRE_LOGIN && !currentUser) {
    window.location.href = "login.html";
    return;
  }

  /* ---------- 1. Pangalan ng user ---------- */
  let displayName = "Justine Salido";

  if (currentUser) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const account = users.find(u => u.email === currentUser.email);
    displayName = (account && account.fullName) || currentUser.username || displayName;
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  }

  const firstName = displayName.split(" ")[0];
  const initials = displayName
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  document.getElementById("welcomeName").textContent = firstName;
  document.getElementById("userName").textContent = displayName;
  document.getElementById("userAvatar").textContent = initials;

  /* ---------- 2. Sidebar links ---------- */
  // Hinaharang lang ang mga link na "#" (wala pang page). Ang may totoong page ay mag-navigate.
  document.querySelectorAll(".nav a").forEach(link => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href") === "#") {
        e.preventDefault();
      }
    });
  });

  /* ---------- 3. Logout ---------- */
  function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }

  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("menuLogout").addEventListener("click", logout);

  /* ---------- 4. User dropdown ---------- */
  const userBtn = document.getElementById("userBtn");
  const userMenu = document.getElementById("userMenu");

  userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.classList.toggle("open");
  });

  document.addEventListener("click", () => userMenu.classList.remove("open"));

  /* ---------- 5. Pets ---------- */
  const petList = document.getElementById("petList");
  const totalPets = document.getElementById("totalPets");

  let pets = JSON.parse(localStorage.getItem("pets"));
  if (!pets) {
    pets = [
      { name: "Bella", breed: "Golden Retriever", age: "2 years old" },
      { name: "Luna", breed: "Persian Cat", age: "1 year old" }
    ];
    localStorage.setItem("pets", JSON.stringify(pets));
  }

  function renderPets() {
    petList.innerHTML = "";

    if (pets.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No pets yet. Add your first pet.";
      petList.appendChild(empty);
    }

    pets.forEach(pet => {
      const row = document.createElement("div");
      row.className = "pet-row";

      const avatar = document.createElement("div");
      avatar.className = "pet-avatar";
      avatar.textContent = pet.name.charAt(0).toUpperCase();

      const line = document.createElement("p");
      line.className = "pet-line";
      const strong = document.createElement("strong");
      strong.textContent = pet.name;
      line.appendChild(strong);
      line.append(" — " + pet.breed + " — " + pet.age);

      const viewBtn = document.createElement("button");
      viewBtn.type = "button";
      viewBtn.className = "btn-small";
      viewBtn.textContent = "View";
      viewBtn.addEventListener("click", () => {
        window.location.href = "pets.html";
      });

      row.append(avatar, line, viewBtn);
      petList.appendChild(row);
    });

    totalPets.textContent = pets.length;
  }

  renderPets();

  /* ---------- 6. Notifications ---------- */
  const notifList = document.getElementById("notifList");
  const notifCount = document.getElementById("notifCount");
  const bellBadge = document.getElementById("bellBadge");

  let notifications = JSON.parse(localStorage.getItem("notifications"));
  if (!notifications) {
    notifications = [
      "Appointment confirmed",
      "Reminder: vaccination for Luna",
      "Message from Dr. Reyes"
    ];
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }

  function renderNotifications() {
    notifList.innerHTML = "";

    if (notifications.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "You're all caught up.";
      notifList.appendChild(empty);
    }

    notifications.forEach((text, index) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "notif-item";
      item.title = "Click to mark as read";

      const dot = document.createElement("span");
      dot.className = "notif-dot";

      const label = document.createElement("span");
      label.textContent = text;

      item.append(dot, label);
      item.addEventListener("click", () => {
        notifications.splice(index, 1);
        localStorage.setItem("notifications", JSON.stringify(notifications));
        renderNotifications();
      });

      notifList.appendChild(item);
    });

    notifCount.textContent = notifications.length;
    bellBadge.textContent = notifications.length;
    bellBadge.classList.toggle("hidden", notifications.length === 0);
  }

  renderNotifications();

  document.getElementById("bellBtn").addEventListener("click", () => {
    document.getElementById("notifCard").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /* ---------- 7. Add pet popup ---------- */
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal">
      <button type="button" class="modal-close" aria-label="Close">&times;</button>
      <h2>Add Pet</h2>
      <form id="petForm" novalidate>
        <input type="text" id="petName" placeholder="Pet's name">
        <select id="petType">
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Other">Other</option>
        </select>
        <input type="text" id="petBreed" placeholder="Breed (e.g. Golden Retriever)">
        <input type="text" id="petAge" placeholder="Age (e.g. 2 years old)">
        <p class="modal-error" id="petError"></p>
        <button type="submit" class="modal-submit">Save Pet</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const petForm = modal.querySelector("#petForm");
  const petName = modal.querySelector("#petName");
  const petType = modal.querySelector("#petType");
  const petBreed = modal.querySelector("#petBreed");
  const petAge = modal.querySelector("#petAge");
  const petError = modal.querySelector("#petError");

  function openModal() {
    petForm.reset();
    petError.textContent = "";
    petName.classList.remove("input-error");
    modal.classList.add("open");
    petName.focus();
  }

  function closeModal() {
    modal.classList.remove("open");
  }

  document.getElementById("addPetBtn").addEventListener("click", openModal);
  modal.querySelector(".modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  petForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = petName.value.trim();
    if (name === "") {
      petName.classList.add("input-error");
      petError.textContent = "Please enter your pet's name.";
      petName.focus();
      return;
    }

    pets.push({
      id: Date.now(),
      name: name,
      type: petType.value,
      breed: petBreed.value.trim() || petType.value,
      age: petAge.value.trim() || "Age not set"
    });

    localStorage.setItem("pets", JSON.stringify(pets));
    renderPets();
    closeModal();
  });

});