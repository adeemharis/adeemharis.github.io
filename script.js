/* ========================================
   Adeem Haris — Portfolio JavaScript
   Features: Navigation, Particles, Blog, 
   Scroll Reveal, Contact Form
   ======================================== */

// ─────────────────────────────────────────
// Navbar: Scroll Effect + Mobile Toggle
// ─────────────────────────────────────────
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navAnchors = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
});

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

navAnchors.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (link) {
            if (scrollY >= top && scrollY < top + height) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });
});

// ─────────────────────────────────────────
// Scroll Reveal (Intersection Observer)
// ─────────────────────────────────────────
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─────────────────────────────────────────
// Particle Canvas (Hero Background)
// ─────────────────────────────────────────
const canvas = document.getElementById('particleCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let particleColor = '6, 182, 212'; // Default cyan RGB

    function resizeCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            // 3D Depth layers
            this.z = Math.random() * 3 + 1; // 1 to 4
            this.vx = (Math.random() - 0.5) * (0.6 / this.z);
            this.vy = (Math.random() - 0.5) * (0.6 / this.z);
            this.radius = (Math.random() * 1.5 + 0.5) * (2 / this.z);
            this.opacity = (Math.random() * 0.3 + 0.1) * (2 / this.z);
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particleColor}, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        resizeCanvas();
        const count = Math.min(100, Math.floor((canvas.width * canvas.height) / 12000));
        particles = Array.from({ length: count }, () => new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                // Only connect particles in similar "Z" layers for cleaner 3D look
                if (Math.abs(particles[i].z - particles[j].z) > 1.2) continue;

                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    const connOpacity = 0.08 * (1 - dist / 150) * (2 / particles[i].z);
                    ctx.strokeStyle = `rgba(${particleColor}, ${connOpacity})`;
                    ctx.lineWidth = 0.4;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        requestAnimationFrame(animateParticles);
    }

    // Expose color update to theme.js
    window.updateParticleSystemColor = (color) => {
        particleColor = color;
    };

    initParticles();
    animateParticles();
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    // Subtle Parallax for Hero Content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        window.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            heroContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }
}

// ─────────────────────────────────────────
// Blog Teaser (Homepage — shows latest 2)
// ─────────────────────────────────────────
const BLOG_STORAGE_KEY = 'adeem_blog_posts';

function getBlogPosts() {
    try {
        return JSON.parse(localStorage.getItem(BLOG_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderBlogTeaser() {
    const grid = document.getElementById('blogTeaserGrid');
    const empty = document.getElementById('blogEmpty');
    if (!grid) return;

    const posts = getBlogPosts();

    if (posts.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    const latest = posts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2);

    grid.innerHTML = latest.map(post => `
        <a href="blog.html?id=${post.id}" class="blog-teaser-card">
            <div class="blog-teaser-card-date">
                <span class="material-icons-outlined">calendar_today</span>
                ${formatDate(post.date)}
            </div>
            <h3>${escapeHTML(post.title)}</h3>
            <p>${escapeHTML(post.excerpt)}</p>
            <div class="blog-teaser-card-tags">
                ${post.tags.map(t => `<span>${escapeHTML(t)}</span>`).join('')}
            </div>
            <span class="blog-teaser-read-more">
                Read article <span class="material-icons-outlined">arrow_forward</span>
            </span>
        </a>
    `).join('');
}

renderBlogTeaser();

// ─────────────────────────────────────────
// Toast Notifications
// ─────────────────────────────────────────
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="material-icons-outlined">check_circle</span> ${message}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ─────────────────────────────────────────
// Contact Form
// ─────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        const mailtoLink = `mailto:adeemharis@gmail.com?subject=Portfolio Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
        window.open(mailtoLink, '_blank');

        contactForm.reset();
        showToast('Opening your email client...');
    });
}
