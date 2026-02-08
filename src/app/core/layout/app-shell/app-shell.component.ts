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

    @if (sidebarOpen()) {
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
      padding: 0.5rem;
      max-width: 100%;
      overflow-x: hidden;
      min-height: calc(100vh - 60px);
    }

    .sidebar-overlay {
      display: none;
    }

    /* Tablet */
    @media (max-width: 1024px) {
      .main-content {
        padding: 1.5rem;
      }
    }

    /* Mobile */
    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
        width: 100%;
      }

      .sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
        z-index: 40;
      }
    }

    /* Small mobile */
    @media (max-width: 480px) {
      .main-content {
        padding: 0.75rem;
      }
    }

    /* Desktop: Never show overlay */
    @media (min-width: 769px) {
      .sidebar-overlay {
        display: none !important;
      }
    }
  `]
})
export class AppShellComponent {
  sidebarOpen = signal(this.getInitialSidebarState());

  private getInitialSidebarState(): boolean {
    // Start with sidebar open on desktop, closed on mobile
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768;
    }
    return true; // Default to open for SSR
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}
