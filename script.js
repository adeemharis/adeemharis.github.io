/* ==========================================================================
   Adeem Haris — Academic Portfolio Client Interactions
   Lightweight, accessible navigation and scroll spy
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------------------------
    // 1. Mobile Navigation Toggle
    // --------------------------------------------------------------------------
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        });

        // Close menu when clicking outside or clicking a nav link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // --------------------------------------------------------------------------
    // 2. Active Section Highlight (Scroll Spy)
    // --------------------------------------------------------------------------
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href === `#${id}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => sectionObserver.observe(section));
    }

    // --------------------------------------------------------------------------
    // 3. Contact Form / Mailto Handler
    // --------------------------------------------------------------------------
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contactName')?.value.trim() || '';
            const email = document.getElementById('contactEmail')?.value.trim() || '';
            const message = document.getElementById('contactMessage')?.value.trim() || '';

            const subject = encodeURIComponent(`Academic Inquiry from ${name}`);
            const body = encodeURIComponent(`From: ${name} (${email})\n\n${message}`);
            const mailtoUri = `mailto:adeemharis@gmail.com?subject=${subject}&body=${body}`;

            window.location.href = mailtoUri;
        });
    }
});
