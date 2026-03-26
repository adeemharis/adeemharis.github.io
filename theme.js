/* ========================================
   Theme Management
   Supports: dark, light, system (auto)
   ======================================== */

(function () {
    const THEME_KEY = 'adeem_theme';

    // Get saved theme or default to 'dark'
    function getSavedTheme() {
        return localStorage.getItem(THEME_KEY) || 'dark';
    }

    // Apply theme to document
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        updateToggleButtons(theme);
        updateParticleColor(theme);
    }

    // Update toggle button active states
    function updateToggleButtons(theme) {
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    // Update particle canvas color for theme
    function updateParticleColor(theme) {
        const style = getComputedStyle(document.documentElement);
        const colorStr = style.getPropertyValue('--particle-color').trim();
        if (window.updateParticleSystemColor && colorStr) {
            window.updateParticleSystemColor(colorStr);
        }
    }

    // Initialize: apply saved theme immediately (before render)
    applyTheme(getSavedTheme());

    // Bind toggle buttons after DOM loads
    document.addEventListener('DOMContentLoaded', () => {
        updateToggleButtons(getSavedTheme());

        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                applyTheme(btn.dataset.theme);
            });
        });
    });

    // Listen for system theme changes when in 'system' mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (getSavedTheme() === 'system') {
            updateParticleColor('system');
        }
    });
})();
