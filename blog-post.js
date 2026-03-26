/* ========================================
   Blog Post View — blog.html
   Post display, reactions, comments
   ======================================== */

const BLOG_STORAGE_KEY = 'adeem_blog_posts';
const REACTIONS_KEY = 'adeem_blog_reactions';
const COMMENTS_KEY = 'adeem_blog_comments';
const ADMIN_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

const REACTION_EMOJIS = [
    { emoji: '👍', label: 'Like' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '💡', label: 'Insightful' },
    { emoji: '👏', label: 'Applause' }
];

// ─────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function timeAgo(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const seconds = Math.floor((now - d) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateStr);
}

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

// ─────────────────────────────────────────
// Reactions System
// ─────────────────────────────────────────
function getReactions(postId) {
    try {
        const all = JSON.parse(localStorage.getItem(REACTIONS_KEY)) || {};
        return all[postId] || {};
    } catch {
        return {};
    }
}

function getUserReactions(postId) {
    try {
        const key = `adeem_user_reactions_${postId}`;
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function toggleReaction(postId, emoji) {
    const all = JSON.parse(localStorage.getItem(REACTIONS_KEY)) || {};
    if (!all[postId]) all[postId] = {};

    const userKey = `adeem_user_reactions_${postId}`;
    let userReactions = getUserReactions(postId);

    if (userReactions.includes(emoji)) {
        // Remove reaction
        all[postId][emoji] = Math.max(0, (all[postId][emoji] || 1) - 1);
        if (all[postId][emoji] === 0) delete all[postId][emoji];
        userReactions = userReactions.filter(e => e !== emoji);
    } else {
        // Add reaction
        all[postId][emoji] = (all[postId][emoji] || 0) + 1;
        userReactions.push(emoji);
    }

    localStorage.setItem(REACTIONS_KEY, JSON.stringify(all));
    localStorage.setItem(userKey, JSON.stringify(userReactions));
    renderReactions(postId);
}

function renderReactions(postId) {
    const container = document.getElementById('reactionsBar');
    const reactions = getReactions(postId);
    const userReactions = getUserReactions(postId);

    container.innerHTML = REACTION_EMOJIS.map(({ emoji, label }) => {
        const count = reactions[emoji] || 0;
        const active = userReactions.includes(emoji) ? 'active' : '';
        return `
            <button class="reaction-btn ${active}" onclick="toggleReaction('${postId}', '${emoji}')" title="${label}">
                <span class="reaction-emoji">${emoji}</span>
                ${count > 0 ? `<span class="reaction-count">${count}</span>` : ''}
            </button>
        `;
    }).join('');
}

// ─────────────────────────────────────────
// Comments System
// ─────────────────────────────────────────
function getComments(postId) {
    try {
        const all = JSON.parse(localStorage.getItem(COMMENTS_KEY)) || {};
        return all[postId] || [];
    } catch {
        return [];
    }
}

function saveComment(postId, name, text) {
    const all = JSON.parse(localStorage.getItem(COMMENTS_KEY)) || {};
    if (!all[postId]) all[postId] = [];

    all[postId].push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        name: name.trim(),
        text: text.trim(),
        date: new Date().toISOString()
    });

    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
    renderComments(postId);
}

function deleteComment(postId, commentId) {
    if (!isAdmin()) return;
    const all = JSON.parse(localStorage.getItem(COMMENTS_KEY)) || {};
    if (all[postId]) {
        all[postId] = all[postId].filter(c => c.id !== commentId);
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
        renderComments(postId);
        showToast('Comment deleted.');
    }
}

function renderComments(postId) {
    const list = document.getElementById('commentsList');
    const count = document.getElementById('commentsCount');
    const comments = getComments(postId);
    const admin = isAdmin();

    count.textContent = comments.length;

    if (comments.length === 0) {
        list.innerHTML = '<p class="comments-empty">No comments yet. Be the first to share your thoughts!</p>';
        return;
    }

    list.innerHTML = comments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(comment => `
            <div class="comment-card">
                <div class="comment-header">
                    <div class="comment-avatar">${escapeHTML(comment.name.charAt(0).toUpperCase())}</div>
                    <div class="comment-info">
                        <span class="comment-name">${escapeHTML(comment.name)}</span>
                        <span class="comment-time">${timeAgo(comment.date)}</span>
                    </div>
                    ${admin ? `
                        <button class="comment-delete" onclick="deleteComment('${postId}', '${comment.id}')" title="Delete comment">
                            <span class="material-icons-outlined">close</span>
                        </button>
                    ` : ''}
                </div>
                <p class="comment-text">${escapeHTML(comment.text)}</p>
            </div>
        `).join('');
}

// Make functions globally available
window.toggleReaction = toggleReaction;
window.deleteComment = deleteComment;

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
// Load and Display Blog Post
// ─────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const postId = params.get('id');
const postView = document.getElementById('postView');

if (postId) {
    try {
        const posts = JSON.parse(localStorage.getItem(BLOG_STORAGE_KEY)) || [];
        const post = posts.find(p => p.id === postId);
        if (post) {
            document.title = `${post.title} — Adeem Haris`;

            // Format content: convert line breaks to paragraphs
            const formattedContent = post.content
                .split('\n\n')
                .filter(p => p.trim())
                .map(p => `<p>${escapeHTML(p.trim())}</p>`)
                .join('');

            postView.innerHTML = `
                <a href="blogs.html" class="post-back">
                    <span class="material-icons-outlined">arrow_back</span> Back to articles
                </a>
                
                <article class="post-article">
                    <h1>${escapeHTML(post.title)}</h1>
                    <div class="post-meta">
                        <div class="post-meta-item">
                            <span class="material-icons-outlined">person</span> Adeem Haris
                        </div>
                        <div class="post-meta-item">
                            <span class="material-icons-outlined">calendar_today</span> ${formatDate(post.date)}
                        </div>
                        ${post.tags.length ? `
                            <div class="post-meta-tags">
                                ${post.tags.map(t => `<span class="post-tag">${escapeHTML(t)}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="post-body">${formattedContent || `<p>${escapeHTML(post.content)}</p>`}</div>
                </article>
                
                <!-- Reactions -->
                <section class="reactions-section">
                    <h3 class="reactions-title">React to this article</h3>
                    <div class="reactions-bar" id="reactionsBar"></div>
                </section>
                
                <!-- Comments -->
                <section class="comments-section">
                    <h3 class="comments-title">
                        <span class="material-icons-outlined">forum</span>
                        Comments <span class="comments-badge" id="commentsCount">0</span>
                    </h3>
                    
                    <form class="comment-form" id="commentForm">
                        <div class="comment-form-row">
                            <input type="text" id="commentName" placeholder="Your name" required maxlength="50">
                        </div>
                        <div class="comment-form-row">
                            <textarea id="commentText" placeholder="Share your thoughts..." required rows="3" maxlength="1000"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <span class="material-icons-outlined">send</span> Post Comment
                        </button>
                    </form>
                    
                    <div class="comments-list" id="commentsList"></div>
                </section>
            `;

            // Initialize reactions and comments
            renderReactions(postId);
            renderComments(postId);

            // Comment form handler
            document.getElementById('commentForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('commentName').value.trim();
                const text = document.getElementById('commentText').value.trim();
                if (name && text) {
                    saveComment(postId, name, text);
                    document.getElementById('commentText').value = '';
                    showToast('Comment posted!');
                }
            });

        } else {
            postView.innerHTML = `
                <a href="blogs.html" class="post-back">
                    <span class="material-icons-outlined">arrow_back</span> Back to articles
                </a>
                <div class="post-not-found">
                    <span class="material-icons-outlined">article</span>
                    <h1>Post Not Found</h1>
                    <p>This article doesn't exist or may have been deleted.</p>
                    <a href="blogs.html" class="btn btn-primary">Browse Articles</a>
                </div>
            `;
        }
    } catch {
        postView.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:100px 20px">Error loading post.</p>';
    }
} else {
    window.location.href = 'blogs.html';
}
