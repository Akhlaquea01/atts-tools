import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    template: `
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <button class="menu-toggle" (click)="toggleSidebar.emit()" aria-label="Toggle menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 class="app-title">
            <span class="title-icon">🔧</span>
            Utility Toolbox
          </h1>
        </div>

        <div class="header-right">
          <span class="privacy-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            100% Local Processing
          </span>

          <button
            class="theme-toggle"
            (click)="themeService.toggleTheme()"
            [attr.aria-label]="'Switch to ' + (themeService.theme() === 'light' ? 'dark' : 'light') + ' mode'"
          >
            @if (themeService.theme() === 'light') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            }
          </button>
        </div>
      </div>
    </header>
  `,
    styles: [`
    .app-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      max-width: 100%;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      color: var(--text);
      border-radius: 0.375rem;
      transition: background-color 0.2s;
    }

    .menu-toggle:hover {
      background: var(--hover);
    }

    .app-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .title-icon {
      font-size: 1.5rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .privacy-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background: var(--success-bg);
      color: var(--success-text);
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .theme-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      color: var(--text);
      border-radius: 0.375rem;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .theme-toggle:hover {
      background: var(--hover);
    }

    @media (max-width: 640px) {
      .privacy-badge span {
        display: none;
      }

      .app-title {
        font-size: 1rem;
      }
    }
  `]
})
export class HeaderComponent {
    themeService = inject(ThemeService);
    toggleSidebar = output<void>();
}

// Add this import at the top
import { output } from '@angular/core';
