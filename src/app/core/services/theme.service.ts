import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

/**
 * ThemeService manages the application theme (light/dark mode)
 * Persists theme preference to localStorage
 * Client-only (browser-only) implementation
 */
@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_STORAGE_KEY = 'app-theme';

    // Using Angular signals for reactive theme state
    theme = signal<Theme>(this.getInitialTheme());

    constructor() {
        // Apply theme on initialization
        this.applyTheme(this.theme());

        // Watch for theme changes and persist + apply
        effect(() => {
            const currentTheme = this.theme();
            this.applyTheme(currentTheme);
            this.persistTheme(currentTheme);
        });
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme(): void {
        this.theme.update(current => current === 'light' ? 'dark' : 'light');
    }

    /**
     * Set a specific theme
     */
    setTheme(theme: Theme): void {
        this.theme.set(theme);
    }

    /**
     * Get initial theme from localStorage or system preference
     */
    private getInitialTheme(): Theme {
        try {
            const stored = localStorage.getItem(this.THEME_STORAGE_KEY);
            if (stored === 'light' || stored === 'dark') {
                return stored;
            }

            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        } catch (error) {
            console.warn('Error reading theme from localStorage:', error);
        }

        return 'light';
    }

    /**
     * Apply theme to document by setting data attribute
     */
    private applyTheme(theme: Theme): void {
        document.documentElement.setAttribute('data-theme', theme);
    }

    /**
     * Persist theme to localStorage
     */
    private persistTheme(theme: Theme): void {
        try {
            localStorage.setItem(this.THEME_STORAGE_KEY, theme);
        } catch (error) {
            console.warn('Error saving theme to localStorage:', error);
        }
    }
}
