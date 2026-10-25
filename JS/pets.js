document.addEventListener("DOMContentLoaded", () => {

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
      const initials = displayName.split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase();

      const userNameEl = document.getElementById("userName");
      const userAvatarEl = document.getElementById("userAvatar");
      
      if (userNameEl) userNameEl.textContent = displayName;
      if (userAvatarEl) userAvatarEl.textContent = initials;
    })
    .catch(() => {
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

  const bellBadge = document.getElementById("bellBadge");
  if (bellBadge) {
    bellBadge.textContent = 0;
    bellBadge.classList.add("hidden");
  }

  document.getElementById("bellBtn").addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });

  let pets = [];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function setPhoto(box, src) {
    box.innerHTML = "";
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Pet photo";
      box.appendChild(img);
    } else {
      box.append("PET", document.createElement("br"), "PHOTO");
    }
  }

  function resizeImage(file, callback) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 500;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  const grid = document.getElementById("petGrid");

  function renderPets() {
    grid.innerHTML = "";

    pets.forEach(pet => {
      const card = el("article", "pet-card");

      const photo = el("div", "pet-photo");
      setPhoto(photo, pet.photo);

      const info = el("div", "pet-info");
      info.append(
        el("div", "", pet.name),
        el("div", "", pet.breed),
        el("div", "", pet.age)
      );

      const actions = el("div", "pet-actions");
      const viewBtn = el("button", "btn-small", "View Profile");
      viewBtn.type = "button";
      viewBtn.addEventListener("click", () => openView(pet));

      const editBtn = el("button", "btn-small", "Edit");
      editBtn.type = "button";
      editBtn.addEventListener("click", () => openForm(pet));

      actions.append(viewBtn, editBtn);
      card.append(photo, info, actions);
      grid.appendChild(card);
    });

    const addCard = el("button", "add-card");
    addCard.type = "button";
    addCard.append(
      el("div", "add-plus", "+"),
      el("div", "add-title", "Add New Pet"),
      el("div", "add-text", "Register your pet's information.")
    );
    addCard.addEventListener("click", () => openForm(null));
    grid.appendChild(addCard);
  }

  const formOverlay = el("div", "modal-overlay");
  formOverlay.innerHTML = `
    <div class="modal">
      <button type="button" class="modal-close" aria-label="Close">&times;</button>
      <h2 id="formTitle">Add Pet</h2>
      <form id="petForm" novalidate>
        <div class="photo-pick">
          <div class="photo-preview" id="photoPreview"></div>
          <label class="photo-btn" for="petPhoto">Choose photo</label>
          <input type="file" id="petPhoto" accept="image/*" hidden>
        </div>
        <input type="text" id="petName" placeholder="Pet's name">
        <select id="petType">
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Other">Other</option>
        </select>
        <input type="text" id="petBreed" placeholder="Breed (e.g. Golden Retriever)">
        <input type="text" id="petAge" placeholder="Age (e.g. 2 years old)">
        <p class="modal-error" id="petError"></p>
        <div class="modal-actions">
          <button type="submit" class="modal-submit">Save Pet</button>
          <button type="button" class="btn-danger" id="deleteBtn" hidden>Delete</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(formOverlay);

  const petForm = formOverlay.querySelector("#petForm");
  const formTitle = formOverlay.querySelector("#formTitle");
  const photoPreview = formOverlay.querySelector("#photoPreview");
  const photoInput = formOverlay.querySelector("#petPhoto");
  const petName = formOverlay.querySelector("#petName");
  const petType = formOverlay.querySelector("#petType");
  const petBreed = formOverlay.querySelector("#petBreed");
  const petAge = formOverlay.querySelector("#petAge");
  const petError = formOverlay.querySelector("#petError");
  const deleteBtn = formOverlay.querySelector("#deleteBtn");

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
      // Walang error message na lalabas sa Live Server
      renderPets(); 
    });

  let editingId = null;
  let photoData = "";

  function openForm(pet) {
    petForm.reset();
    petError.textContent = "";
    petName.classList.remove("input-error");

    if (pet) {
      editingId = pet.id;
      formTitle.textContent = "Edit Pet";
      petName.value = pet.name;
      petType.value = pet.type || "Dog";
      petBreed.value = pet.breed === pet.type ? "" : pet.breed;
      petAge.value = pet.age === "Age not set" ? "" : pet.age;
      photoData = pet.photo || "";
      deleteBtn.hidden = false;
    } else {
      editingId = null;
      formTitle.textContent = "Add Pet";
      photoData = "";
      deleteBtn.hidden = true;
    }

    setPhoto(photoPreview, photoData);
    formOverlay.classList.add("open");
    petName.focus();
  }

  function closeForm() {
    formOverlay.classList.remove("open");
  }

  document.getElementById("addPetTop").addEventListener("click", () => openForm(null));
  formOverlay.querySelector(".modal-close").addEventListener("click", closeForm);
  formOverlay.addEventListener("click", (e) => {
    if (e.target === formOverlay) closeForm();
  });

  petName.addEventListener("input", () => {
    petName.classList.remove("input-error");
    petError.textContent = "";
  });

  photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      petError.textContent = "Please choose an image file.";
      return;
    }

    petError.textContent = "";
    resizeImage(file, (data) => {
      photoData = data;
      setPhoto(photoPreview, photoData);
    });
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

    const data = {
      name: name,
      type: petType.value,
      breed: petBreed.value.trim() || petType.value,
      age: petAge.value.trim() || "Age not set",
      photo: photoData
    };

    const saveButton = petForm.querySelector('[type="submit"]');
    saveButton.disabled = true;
    try {
      const response = await fetch("../PHP/pets.php" + (editingId ? "?id=" + encodeURIComponent(editingId) : ""), {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not save your pet.");
      if (editingId) {
        pets = pets.map(pet => String(pet.id) === String(editingId) ? result.pet : pet);
      } else {
        pets.unshift(result.pet);
      }
      renderPets();
      closeForm();
    } catch (error) {
      petError.textContent = error.message || "Could not reach the server. Please try again.";
    } finally {
      saveButton.disabled = false;
    }
  });

  deleteBtn.addEventListener("click", async () => {
    const pet = pets.find(p => p.id === editingId);
    if (!pet) return;

    if (confirm("Delete " + pet.name + "? This cannot be undone.")) {
      try {
        const response = await fetch("../PHP/pets.php?id=" + encodeURIComponent(editingId), {
          method: "DELETE",
          credentials: "same-origin"
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Could not delete the pet.");
        pets = pets.filter(pet => String(pet.id) !== String(editingId));
        renderPets();
        closeForm();
      } catch (error) {
        petError.textContent = error.message || "Could not reach the server. Please try again.";
      }
    }
  });

  const viewOverlay = el("div", "modal-overlay");
  viewOverlay.innerHTML = `
    <div class="modal">
      <button type="button" class="modal-close" aria-label="Close">&times;</button>
      <div class="view-photo" id="viewPhoto"></div>
      <h2 class="view-title" id="viewName"></h2>
      <div class="view-rows">
        <div class="view-row"><span>Type</span><span id="viewType"></span></div>
        <div class="view-row"><span>Breed</span><span id="viewBreed"></span></div>
        <div class="view-row"><span>Age</span><span id="viewAge"></span></div>
      </div>
      <div class="modal-actions">
        <button type="button" class="modal-submit" id="viewEdit">Edit Pet</button>
      </div>
    </div>
  `;
  document.body.appendChild(viewOverlay);

  const viewPhoto = viewOverlay.querySelector("#viewPhoto");
  const viewName = viewOverlay.querySelector("#viewName");
  const viewType = viewOverlay.querySelector("#viewType");
  const viewBreed = viewOverlay.querySelector("#viewBreed");
  const viewAge = viewOverlay.querySelector("#viewAge");
  let viewing = null;

  function openView(pet) {
    viewing = pet;
    setPhoto(viewPhoto, pet.photo);
    viewName.textContent = pet.name;
    viewType.textContent = pet.type || "Not set";
    viewBreed.textContent = pet.breed;
    viewAge.textContent = pet.age;
    viewOverlay.classList.add("open");
  }

  function closeView() {
    viewOverlay.classList.remove("open");
  }

  viewOverlay.querySelector(".modal-close").addEventListener("click", closeView);
  viewOverlay.addEventListener("click", (e) => {
    if (e.target === viewOverlay) closeView();
  });
  viewOverlay.querySelector("#viewEdit").addEventListener("click", () => {
    closeView();
    openForm(viewing);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeForm();
      closeView();
    }
  });

});