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

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        event.preventDefault();
        return;
      }

      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  document.querySelectorAll(".about-image img, .why-image img").forEach(img => {
    img.addEventListener("error", () => {
      img.alt = "Pet Care Clinic image unavailable";
      img.style.backgroundColor = "#eaf4ff";
    });
  });

});