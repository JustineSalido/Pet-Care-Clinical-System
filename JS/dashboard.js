document.addEventListener("DOMContentLoaded", () => {

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  fetch("../PHP/get_profile.php", { credentials: "same-origin" })
    .then(async response => {
      if (response.status === 401) {
        window.location.href = "login.html";
        return null;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not load profile.");
      return result.user;
    })
    .then(user => {
      if (!user) return;
      const displayName = user.full_name;
      
      const welcomeEl = document.getElementById("welcomeName");
      const nameEl = document.getElementById("userName");
      const avatarEl = document.getElementById("userAvatar");
      
      if (welcomeEl) welcomeEl.textContent = displayName.split(/\s+/)[0];
      if (nameEl) nameEl.textContent = displayName;
      if (avatarEl) avatarEl.textContent = displayName.split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase();
    })
    .catch(() => {
    });

  document.querySelectorAll(".nav a").forEach(link => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href") === "#") {
        e.preventDefault();
      }
    });
  });

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

  const petList = document.getElementById("petList");
  const totalPets = document.getElementById("totalPets");

  let pets = [];

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
      line.append(" — " + (pet.breed || pet.type) + " — " + (pet.age || "Age not set"));

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

  fetch("../PHP/get_pets.php", { credentials: "same-origin" })
    .then(async response => {
      if (response.status === 401) {
        window.location.href = "login.html";
        return [];
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not load pets.");
      return result;
    })
    .then(data => { pets = data; renderPets(); })
    .catch(() => {
      // Silent fail kapag Live Server
      petList.innerHTML = "";
      petList.appendChild(el("p", "empty", "No pets yet. Add your first pet."));
    });

  const notifList = document.getElementById("notifList");
  const notifCount = document.getElementById("notifCount");
  const bellBadge = document.getElementById("bellBadge");

  let notifications = [];

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

  petForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = petName.value.trim();
    if (name === "") {
      petName.classList.add("input-error");
      petError.textContent = "Please enter your pet's name.";
      petName.focus();
      return;
    }

    const pet = {
      name: name,
      type: petType.value,
      breed: petBreed.value.trim() || petType.value,
      age: petAge.value.trim() || "Age not set"
    };
    
    const saveButton = petForm.querySelector('[type="submit"]');
    saveButton.disabled = true;
    try {
      const response = await fetch("../PHP/pets.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(pet)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not save your pet.");
      
      pets.unshift(result.pet);
      renderPets();
      closeModal();
    } catch (error) {
      petError.textContent = error.message || "Could not reach the server. Please try again.";
    } finally {
      saveButton.disabled = false;
    }
  });

});