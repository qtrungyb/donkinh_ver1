/**
 * ============================================================================
 * THEME.JS - QUẢN LÝ CHẾ ĐỘ SÁNG/TỐI & MÀU CHỦ ĐẠO
 * ============================================================================
 */

export const ThemeManager = {
    DEFAULTS: {
        mode: 'light',      // 'light' | 'dark' | 'auto'
        accent: 'blue',     // 'mono' | 'blue' | 'purple' | ...
        customHue: 220,
        customSat: 85,
        customLight: 52
    },

    init() {
        // Đọc cài đặt đã lưu
        const mode = localStorage.getItem('dk_theme_mode') || this.DEFAULTS.mode;
        const accent = localStorage.getItem('dk_theme_accent') || this.DEFAULTS.accent;
        const hue = parseInt(localStorage.getItem('dk_theme_hue') || this.DEFAULTS.customHue);
        const sat = parseInt(localStorage.getItem('dk_theme_sat') || this.DEFAULTS.customSat);
        const light = parseInt(localStorage.getItem('dk_theme_light') || this.DEFAULTS.customLight);

        this.applyMode(mode, false);
        this.applyAccent(accent, hue, sat, light);

        // Tự động cập nhật nếu ở chế độ "auto"
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            if (localStorage.getItem('dk_theme_mode') === 'auto') {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.removeEventListener('change', handler);
        mediaQuery.addEventListener('change', handler);
    },

    applyMode(mode, save = true) {
        let effectiveMode = mode;
        if (mode === 'auto') {
            effectiveMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', effectiveMode);
        document.documentElement.setAttribute('data-mode-pref', mode);
        if (save) localStorage.setItem('dk_theme_mode', mode);
        document.dispatchEvent(new CustomEvent('theme:mode-changed', { detail: { mode, effectiveMode } }));
    },

    applyAccent(accent, hue, sat, light) {
        if (accent === 'custom') {
            document.documentElement.removeAttribute('data-accent');
            const root = document.documentElement;
            root.style.setProperty('--accent-h', hue);
            root.style.setProperty('--accent-s', sat + '%');
            root.style.setProperty('--accent-l', light + '%');
        } else {
            document.documentElement.style.removeProperty('--accent-h');
            document.documentElement.style.removeProperty('--accent-s');
            document.documentElement.style.removeProperty('--accent-l');
            document.documentElement.setAttribute('data-accent', accent);
        }
        localStorage.setItem('dk_theme_accent', accent);
        localStorage.setItem('dk_theme_hue', hue);
        localStorage.setItem('dk_theme_sat', sat);
        localStorage.setItem('dk_theme_light', light);
        document.dispatchEvent(new CustomEvent('theme:accent-changed', { detail: { accent, hue, sat, light } }));
    },

    getCurrent() {
        return {
            mode: localStorage.getItem('dk_theme_mode') || this.DEFAULTS.mode,
            accent: localStorage.getItem('dk_theme_accent') || this.DEFAULTS.accent,
            hue: parseInt(localStorage.getItem('dk_theme_hue') || this.DEFAULTS.customHue),
            sat: parseInt(localStorage.getItem('dk_theme_sat') || this.DEFAULTS.customSat),
            light: parseInt(localStorage.getItem('dk_theme_light') || this.DEFAULTS.customLight)
        };
    }
};