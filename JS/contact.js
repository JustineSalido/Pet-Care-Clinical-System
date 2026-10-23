document.addEventListener("DOMContentLoaded", () => {

  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");

      if (href && !href.startsWith("#")) {
        navLinks.forEach(item => {
          item.classList.remove("active");
        });
        link.classList.add("active");
      }
    });
  });

  const messageInput = document.getElementById("message");
  const messageCount = document.getElementById("messageCount");

  if (messageInput && messageCount) {
    const updateCharacterCount = () => {
      messageCount.textContent = messageInput.value.length;
    };

    messageInput.addEventListener("input", updateCharacterCount);
    updateCharacterCount();
  }

  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", event => {
      event.preventDefault();

      formStatus.className = "form-status";
      formStatus.textContent = "";

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const fullName = document.getElementById("fullName").value.trim();
      const email = document.getElementById("email").value.trim();
      const subject = document.getElementById("subject").value;
      const message = document.getElementById("message").value.trim();

      if (!fullName || !email || !subject || !message) {
        formStatus.textContent = "Please complete all required fields.";
        formStatus.classList.add("error");
        return;
      }

      formStatus.textContent = "Your form passed the front-end checks. Message sending is not connected yet.";
      formStatus.classList.add("success");
    });
  }

});