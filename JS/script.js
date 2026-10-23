document.addEventListener("DOMContentLoaded", () => {

  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      if (href && href !== "#") {
        return;
      }

      e.preventDefault();

      navLinks.forEach(item => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  const cards = document.querySelectorAll(".feature-card");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });

    cards.forEach((card, index) => {
      card.classList.add("hidden");
      card.style.transitionDelay = `${index * 120}ms`;
      observer.observe(card);
    });
  } else {
    cards.forEach(card => card.classList.add("show"));
  }

  const bookButton = document.querySelector(".hero-buttons .btn-primary");

  if (bookButton) {
    bookButton.setAttribute("href", "../HTML/login.html");
  }

  const learnMore = document.querySelector(".hero-buttons .btn-outline");

  if (learnMore) {
    learnMore.setAttribute("href", "../HTML/services.html");
  }

  document.querySelectorAll(".photo-box img").forEach(img => {
    img.addEventListener("error", () => {
      const photoBox = img.parentElement;

      img.remove();

      const message = document.createElement("h2");
      message.textContent = "Image not found";

      photoBox.appendChild(message);
    });
  });

});