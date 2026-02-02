import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
    selector: 'app-shell',
    standalone: true,
    imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
    template: `
    <div class="app-shell">
      <app-header (toggleSidebar)="toggleSidebar()" />

      <div class="app-body">
        <app-sidebar [isOpen]="sidebarOpen()" />

        <main class="main-content">
          <router-outlet />
        </main>
      </div>
    </div>

    @if (!sidebarOpen()) {
      <div class="sidebar-overlay" (click)="toggleSidebar()"></div>
    }
  `,
    styles: [`
    .app-shell {
      min-height: 100vh;
      background: var(--background);
    }

    .app-body {
      display: flex;
      position: relative;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 100%;
      overflow-x: hidden;
    }

    .sidebar-overlay {
      display: none;
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
      }

      .sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 40;
      }
    }

    @media (min-width: 769px) {
      .sidebar-overlay {
        display: none !important;
      }
    }
  `]
})
export class AppShellComponent {
    sidebarOpen = signal(true);

    toggleSidebar(): void {
        this.sidebarOpen.update(v => !v);
    }
}
