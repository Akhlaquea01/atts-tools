import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="settings-container">
      <h2>⚙️ Settings</h2>

      <div class="setting-section">
        <h3>Appearance</h3>
        <div class="setting-item">
          <div>
            <strong>Theme</strong>
            <p class="text-muted">Choose between light and dark mode</p>
          </div>
          <button class="btn btn-secondary" (click)="themeService.toggleTheme()">
            @if (themeService.theme() === 'light') {
              🌙 Switch to Dark
            } @else {
              ☀️ Switch to Light
            }
          </button>
        </div>
      </div>

      <div class="setting-section">
        <h3>About</h3>
        <p>Angular Utility Toolbox - Privacy-first, offline-first browser tools</p>
        <p class="text-muted">Version 1.0.0</p>
      </div>
    </div>
  `,
    styles: [`
    .settings-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .setting-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 2rem;
      margin-bottom: 1.5rem;
    }

    .setting-section h3 {
      margin-bottom: 1rem;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .setting-item p {
      margin: 0;
      font-size: 0.875rem;
    }

    @media (max-width: 640px) {
      .setting-item {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class SettingsComponent {
    themeService = inject(ThemeService);
}
