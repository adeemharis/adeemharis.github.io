/* ==========================================================================
   Theme Management — Adeem Haris Academic Portfolio
   Supports: 'light' (default), 'dark', 'system' (OS preference)
   ========================================================================== */

(function () {
    const THEME_KEY = 'adeem_theme';

    function getSystemTheme() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    function getSavedTheme() {
        return localStorage.getItem(THEME_KEY) || 'system';
    }

    function applyTheme(theme) {
        const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
        document.documentElement.setAttribute('data-theme', effectiveTheme);
        localStorage.setItem(THEME_KEY, theme);
        updateToggleButtons(theme);
    }

    function updateToggleButtons(theme) {
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            const isActive = btn.dataset.theme === theme;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    // Apply immediately to prevent Flash of Unstyled Theme (FOUC)
    const initialTheme = getSavedTheme();
    applyTheme(initialTheme);

    // Bind event listeners when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        updateToggleButtons(getSavedTheme());

        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                applyTheme(btn.dataset.theme);
            });
        });
    });

    // Listen for OS system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (getSavedTheme() === 'system') {
                applyTheme('system');
            }
        });
    }
})();
