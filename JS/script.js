document.addEventListener("DOMContentLoaded", () => {

    /* ---------- 1. Active nav link ---------- */
    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");

            // Allow actual page navigation if the link has a destination.
            if (href && href !== "#") {
                return;
            }

            e.preventDefault();

            navLinks.forEach(item => item.classList.remove("active"));
            link.classList.add("active");
        });
    });


    /* ---------- 2. Fade-in feature cards on scroll ---------- */
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

            // Stagger the animation of each card.
            card.style.transitionDelay = `${index * 120}ms`;

            observer.observe(card);
        });
    } else {
        // Fallback for browsers without IntersectionObserver.
        cards.forEach(card => card.classList.add("show"));
    }


    /* ---------- 3. Book an Appointment navigation ---------- */
    const bookButton = document.querySelector(
        ".hero-buttons .btn-primary"
    );

    if (bookButton) {
        bookButton.setAttribute("href", "../HTML/login.html");

        // No preventDefault() here.
        // The browser will navigate directly to the login page.
    }


    /* ---------- 4. Learn More navigation ---------- */
    // FIX: Removed preventDefault() and scrollIntoView so the browser
    // navigates directly to services.html (as set in the HTML href).
    const learnMore = document.querySelector(
        ".hero-buttons .btn-outline"
    );

    if (learnMore) {
        // Ensure the href points to the services page.
        learnMore.setAttribute("href", "../HTML/services.html");

        // No preventDefault() here.
        // The browser will navigate directly to the services page.
    }


    /* ---------- 5. Image fallback ---------- */
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