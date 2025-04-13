// Smooth scrolling for navigation links
const anchors = document.querySelectorAll('a[href^="#"]');
if (anchors) {
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Contact form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('感謝您的訊息！我們會盡快回覆。');
        this.reset();
    });
}

// Scroll-based navbar background
const navbar = document.querySelector('.navbar');
if (navbar) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.backgroundColor = 'transparent';
        }
    });
}

// Add event listeners only if elements exist
const elements = document.querySelectorAll('a[href^="#"], #contact-form, .navbar');
if (!elements.length) {
    console.warn('Warning: Some required DOM elements not found.');
}
