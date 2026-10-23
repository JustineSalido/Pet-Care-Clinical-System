document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const forgotLink = document.querySelector(".forgot");

  if (!localStorage.getItem("users")) {
    const demoUsers = [
      { username: "admin", email: "admin@petcare.com", password: "123456" }
    ];
    localStorage.setItem("users", JSON.stringify(demoUsers));
  }

  const eyeOpen = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`;

  const eyeOff = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path>
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>`;

  const wrap = document.createElement("div");
  wrap.className = "password-wrap";
  passwordInput.parentNode.insertBefore(wrap, passwordInput);
  wrap.appendChild(passwordInput);

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "toggle-password";
  toggleBtn.setAttribute("aria-label", "Show password");
  toggleBtn.innerHTML = eyeOpen;
  wrap.appendChild(toggleBtn);

  toggleBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleBtn.innerHTML = isHidden ? eyeOff : eyeOpen;
    toggleBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  });

  const message = document.createElement("p");
  message.className = "form-message";
  form.querySelector(".btn-login").before(message);

  function showMessage(text, type) {
    message.textContent = text;
    message.className = "form-message " + type;
  }

  function clearMessage() {
    message.textContent = "";
    message.className = "form-message";
    usernameInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
  }

  usernameInput.addEventListener("input", clearMessage);
  passwordInput.addEventListener("input", clearMessage);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearMessage();

    const userValue = usernameInput.value.trim().toLowerCase();
    const passValue = passwordInput.value;

    if (userValue === "") {
      usernameInput.classList.add("input-error");
      showMessage("Please enter your email or username.", "error");
      usernameInput.focus();
      return;
    }

    if (passValue.length < 6) {
      passwordInput.classList.add("input-error");
      showMessage("Password must be at least 6 characters.", "error");
      passwordInput.focus();
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find(user =>
      (user.username.toLowerCase() === userValue || user.email.toLowerCase() === userValue) &&
      user.password === passValue
    );

    if (!foundUser) {
      usernameInput.classList.add("input-error");
      passwordInput.classList.add("input-error");
      showMessage("Incorrect username or password.", "error");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify({
      username: foundUser.username,
      email: foundUser.email
    }));

    showMessage("Login successful! Redirecting...", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  });

  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    const email = prompt("Enter your email to reset your password:");

    if (email && email.includes("@")) {
      alert("If " + email + " has an account, a reset link will be sent.");
    } else if (email !== null) {
      alert("Please enter a valid email address.");
    }
  });

});