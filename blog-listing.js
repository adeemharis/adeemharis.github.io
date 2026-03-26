/* ========================================
   Blog Listing Page — blogs.html
   Admin-only publishing, full article list
   ======================================== */

const BLOG_STORAGE_KEY = 'adeem_blog_posts';
const ADMIN_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // SHA-256 of 'admin'

// ─────────────────────────────────────────
// Admin Authentication
// ─────────────────────────────────────────
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function isAdmin() {
    return sessionStorage.getItem('adeem_admin') === 'true';
}

async function adminLogin(password) {
    const hash = await hashPassword(password);
    if (hash === ADMIN_HASH) {
        sessionStorage.setItem('adeem_admin', 'true');
        return true;
    }
    return false;
}

function adminLogout() {
    sessionStorage.removeItem('adeem_admin');
    updateAdminUI();
    renderBlogListing();
}

function updateAdminUI() {
    const adminControls = document.getElementById('adminControls');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const adminIndicator = document.getElementById('adminIndicator');

    if (isAdmin()) {
        adminControls.classList.add('visible');
        adminLoginBtn.style.display = 'none';
        adminLogoutBtn.style.display = 'inline-flex';
        adminIndicator.classList.add('active');
    } else {
        adminControls.classList.remove('visible');
        adminLoginBtn.style.display = 'inline-flex';
        adminLogoutBtn.style.display = 'none';
        adminIndicator.classList.remove('active');
    }
}

// ─────────────────────────────────────────
// Blog CRUD
// ─────────────────────────────────────────
function getBlogPosts() {
    try {
        return JSON.parse(localStorage.getItem(BLOG_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveBlogPosts(posts) {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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

// ─────────────────────────────────────────
// Render Blog Listing
// ─────────────────────────────────────────
function renderBlogListing() {
    const grid = document.getElementById('blogListingGrid');
    const empty = document.getElementById('blogListingEmpty');
    const posts = getBlogPosts();
    const admin = isAdmin();

    if (posts.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    grid.innerHTML = posts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(post => `
            <article class="blog-listing-card" data-id="${post.id}" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare data-tilt-max-glare="0.1">
                <div class="blog-listing-card-date">
                    <span class="material-icons-outlined">calendar_today</span>
                    ${formatDate(post.date)}
                </div>
                <h2>${escapeHTML(post.title)}</h2>
                <p class="blog-listing-card-excerpt">${escapeHTML(post.excerpt)}</p>
                <div class="blog-listing-card-tags">
                    ${post.tags.map(t => `<span>${escapeHTML(t)}</span>`).join('')}
                </div>
                <div class="blog-listing-card-footer">
                    <a href="blog.html?id=${post.id}" class="blog-listing-read-more">
                        Read article <span class="material-icons-outlined">arrow_forward</span>
                    </a>
                    ${admin ? `
                        <div class="blog-listing-actions">
                            <button class="blog-action-btn" onclick="editPost('${post.id}')" title="Edit">
                                <span class="material-icons-outlined">edit</span>
                            </button>
                            <button class="blog-action-btn blog-action-btn-delete" onclick="deletePost('${post.id}')" title="Delete">
                                <span class="material-icons-outlined">delete_outline</span>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </article>
        `).join('');
}

// ─────────────────────────────────────────
// Blog Write/Edit Form
// ─────────────────────────────────────────
const blogWriteSection = document.getElementById('blogWriteSection');
const blogWriteForm = document.getElementById('blogWriteForm');
const blogWriteTitle = document.getElementById('blogWriteTitle');
const cancelWriteBtn = document.getElementById('cancelWriteBtn');

function showWriteForm(editId = null) {
    blogWriteForm.reset();
    document.getElementById('writePostId').value = '';

    if (editId) {
        const posts = getBlogPosts();
        const post = posts.find(p => p.id === editId);
        if (post) {
            blogWriteTitle.textContent = 'Edit Article';
            document.getElementById('writePostId').value = post.id;
            document.getElementById('writePostTitle').value = post.title;
            document.getElementById('writePostTags').value = post.tags.join(', ');
            document.getElementById('writePostExcerpt').value = post.excerpt;
            document.getElementById('writePostContent').value = post.content;
        }
    } else {
        blogWriteTitle.textContent = 'Write New Article';
    }

    blogWriteSection.classList.add('visible');
    blogWriteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideWriteForm() {
    blogWriteSection.classList.remove('visible');
}

cancelWriteBtn.addEventListener('click', hideWriteForm);

blogWriteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isAdmin()) return;

    const posts = getBlogPosts();
    const id = document.getElementById('writePostId').value;
    const postData = {
        id: id || generateId(),
        title: document.getElementById('writePostTitle').value.trim(),
        tags: document.getElementById('writePostTags').value.split(',').map(t => t.trim()).filter(Boolean),
        excerpt: document.getElementById('writePostExcerpt').value.trim(),
        content: document.getElementById('writePostContent').value.trim(),
        date: id ? (posts.find(p => p.id === id)?.date || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (id) {
        const index = posts.findIndex(p => p.id === id);
        if (index !== -1) posts[index] = postData;
    } else {
        posts.push(postData);
    }

    saveBlogPosts(posts);
    hideWriteForm();
    renderBlogListing();
    showToast(id ? 'Article updated!' : 'Article published!');
});

// ─────────────────────────────────────────
// Admin Actions
// ─────────────────────────────────────────
window.editPost = function (id) {
    showWriteForm(id);
};

window.deletePost = function (id) {
    if (confirm('Are you sure you want to delete this article?')) {
        const posts = getBlogPosts().filter(p => p.id !== id);
        saveBlogPosts(posts);
        renderBlogListing();
        showToast('Article deleted.');
    }
};

// ─────────────────────────────────────────
// Admin Login Modal
// ─────────────────────────────────────────
const adminModal = document.getElementById('adminLoginModal');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminModalClose = document.getElementById('adminModalClose');
const adminError = document.getElementById('adminError');

adminLoginBtn.addEventListener('click', () => {
    adminModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    adminError.style.display = 'none';
    document.getElementById('adminPassword').value = '';
    setTimeout(() => document.getElementById('adminPassword').focus(), 100);
});

function closeAdminModal() {
    adminModal.classList.remove('active');
    document.body.style.overflow = '';
}

adminModalClose.addEventListener('click', closeAdminModal);
adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) closeAdminModal();
});

adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    const success = await adminLogin(password);
    if (success) {
        closeAdminModal();
        updateAdminUI();
        renderBlogListing();
        showToast('Welcome back, Adeem!');
    } else {
        adminError.style.display = 'block';
        document.getElementById('adminPassword').value = '';
    }
});

adminLogoutBtn.addEventListener('click', () => {
    adminLogout();
    showToast('Logged out.');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAdminModal();
        hideWriteForm();
    }
});

// ─────────────────────────────────────────
// New Post Button
// ─────────────────────────────────────────
const writeNewBtn = document.getElementById('writeNewBtn');
writeNewBtn.addEventListener('click', () => showWriteForm());

// ─────────────────────────────────────────
// Toast
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
// Mobile Nav
// ─────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// ─────────────────────────────────────────
// Initialize
// ─────────────────────────────────────────
updateAdminUI();
renderBlogListing();
