document.addEventListener("DOMContentLoaded", () => {

  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(item => {
        item.classList.remove("active");
      });
      
      link.classList.add("active");
    });
  });

  const cards = document.querySelectorAll(".service-card");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });

    cards.forEach(card => observer.observe(card));
  }

});