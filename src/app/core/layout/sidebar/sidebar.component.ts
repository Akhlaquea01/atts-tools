import { Component, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
    icon: string;
    label: string;
    route: string;
    children?: NavItem[];
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <aside class="sidebar" [class.collapsed]="!isOpen()">
      <nav class="sidebar-nav">
        <a
          routerLink="/dashboard"
          routerLinkActive="active"
          class="nav-item"
          [class.exact]="true"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-label">Dashboard</span>
        </a>

        @for (item of navItems; track item.route) {
          <div class="nav-section">
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          </div>
        }
      </nav>
    </aside>
  `,
    styles: [`
    .sidebar {
      background: var(--surface);
      border-right: 1px solid var(--border);
      width: 250px;
      height: calc(100vh - 60px);
      position: sticky;
      top: 60px;
      overflow-y: auto;
      transition: transform 0.3s ease;
    }

    .sidebar.collapsed {
      transform: translateX(-100%);
    }

    .sidebar-nav {
      padding: 1rem 0;
    }

    .nav-section {
      margin-bottom: 0.25rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background: var(--hover);
      color: var(--text);
    }

    .nav-item.active {
      background: var(--primary-bg);
      color: var(--primary);
      border-left-color: var(--primary);
      font-weight: 500;
    }

    .nav-icon {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
    }

    .nav-label {
      flex: 1;
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        z-index: 50;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
      }
    }

    /* Custom scrollbar */
    .sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 3px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary);
    }
  `]
})
export class SidebarComponent {
    isOpen = input<boolean>(true);

    navItems: NavItem[] = [
        { icon: '🔐', label: 'Crypto Tools', route: '/crypto' },
        { icon: '📝', label: 'JSON Tools', route: '/json-tools' },
        { icon: '📄', label: 'Text Tools', route: '/text-tools' },
        { icon: '📁', label: 'File Utilities', route: '/file-utilities' },
        { icon: '🖼️', label: 'Image Tools', route: '/image-tools' },
        { icon: '⚙️', label: 'Settings', route: '/settings' }
    ];
}
