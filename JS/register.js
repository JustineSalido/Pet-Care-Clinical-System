document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("registerForm");
  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const terms = document.getElementById("terms");

  /* ---------- 1. Eye icon sa 2 password field ---------- */
  const eyeOpen = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`;

  const eyeOff = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path>
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>`;

  document.querySelectorAll(".password-wrap").forEach(wrap => {
    const input = wrap.querySelector("input");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "toggle-password";
    btn.setAttribute("aria-label", "Show password");
    btn.innerHTML = eyeOpen;
    wrap.appendChild(btn);

    btn.addEventListener("click", () => {
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      btn.innerHTML = isHidden ? eyeOff : eyeOpen;
      btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });
  });

  /* ---------- 2. Message box ---------- */
  const message = document.createElement("p");
  message.className = "form-message";
  form.querySelector(".btn-register").before(message);

  const fields = [fullName, email, username, password, confirmPassword];

  function showMessage(text, type) {
    message.textContent = text;
    message.className = "form-message " + type;
  }

  function clearMessage() {
    message.textContent = "";
    message.className = "form-message";
    fields.forEach(f => f.classList.remove("input-error"));
  }

  function fail(field, text) {
    clearMessage();
    if (field) field.classList.add("input-error");
    showMessage(text, "error");
    if (field) field.focus();
  }

  fields.forEach(f => f.addEventListener("input", clearMessage));
  terms.addEventListener("change", clearMessage);

  /* ---------- 3. Register submit ---------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearMessage();

    const nameValue = fullName.value.trim();
    const emailValue = email.value.trim().toLowerCase();
    const userValue = username.value.trim();
    const passValue = password.value;
    const confirmValue = confirmPassword.value;

    // Validation
    if (nameValue.length < 2) {
      return fail(fullName, "Please enter your full name.");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
      return fail(email, "Please enter a valid email address.");
    }

    const usernamePattern = /^[a-zA-Z0-9_]{3,}$/;
    if (!usernamePattern.test(userValue)) {
      return fail(username, "Username must be 3+ characters (letters, numbers, underscore).");
    }

    if (passValue.length < 6) {
      return fail(password, "Password must be at least 6 characters.");
    }

    if (passValue !== confirmValue) {
      return fail(confirmPassword, "Passwords do not match.");
    }

    if (!terms.checked) {
      return fail(null, "Please agree to the Terms and Privacy Policy.");
    }

    // Check duplicates
    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some(u => u.email.toLowerCase() === emailValue)) {
      return fail(email, "That email is already registered.");
    }

    if (users.some(u => u.username.toLowerCase() === userValue.toLowerCase())) {
      return fail(username, "That username is already taken.");
    }

    // Save new account (same list the login page reads)
    users.push({
      fullName: nameValue,
      username: userValue,
      email: emailValue,
      password: passValue
    });
    localStorage.setItem("users", JSON.stringify(users));

    showMessage("Account created! Redirecting to login...", "success");
    form.reset();

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  });

});