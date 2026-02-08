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
        @for (item of navItems; track item.route) {
          <div class="nav-section">
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: !item.children }"
              class="nav-item"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>

            @if (item.children) {
              <div class="nav-children">
                @for (child of item.children; track child.route) {
                  <a
                    [routerLink]="child.route"
                    routerLinkActive="active"
                    class="nav-child-item"
                  >
                    <span class="nav-icon">{{ child.icon }}</span>
                    <span class="nav-label">{{ child.label }}</span>
                  </a>
                }
              </div>
            }
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
      flex-shrink: 0;
    }

    .nav-label {
      flex: 1;
    }

    .nav-children {
      background: rgba(0, 0, 0, 0.02);
      border-left: 2px solid var(--primary);
      margin-left: 1.5rem;
    }

    .nav-child-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 1.5rem;
      padding-left: 2rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;
      font-size: 0.9rem;
    }

    .nav-child-item:hover {
      background: var(--hover);
      color: var(--text);
    }

    .nav-child-item.active {
      background: var(--primary-bg);
      color: var(--primary);
      font-weight: 500;
    }

    .nav-child-item .nav-icon {
      font-size: 1rem;
    }

    /* Desktop: Sticky sidebar */
    @media (min-width: 769px) {
      .sidebar {
        position: sticky;
        top: 60px;
      }
    }

    /* Mobile: Fixed sidebar with overlay */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 60px;
        left: 0;
        bottom: 0;
        z-index: 50;
        height: calc(100vh - 60px);
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
      }
    }

    /* Tablet adjustments */
    @media (max-width: 1024px) {
      .sidebar {
        width: 220px;
      }

      .nav-item, .nav-child-item {
        padding-left: 1rem;
        padding-right: 1rem;
      }

      .nav-children {
        margin-left: 1rem;
      }
    }

    /* Small mobile screens */
    @media (max-width: 480px) {
      .sidebar {
        width: 280px;
        max-width: 80vw;
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
    {
      icon: '📝',
      label: 'JSON Tools',
      route: '/json-tools',
      children: [
        { icon: '✨', label: 'Formatter', route: '/json-tools/formatter' },
        { icon: '🔍', label: 'Diff Viewer', route: '/json-tools/diff' },
        { icon: '📊', label: 'CSV Converter', route: '/json-tools/csv-converter' },
        { icon: '👀', label: 'JSON Viewer', route: '/json-tools/viewer' }
      ]
    },
    { icon: '📄', label: 'Text Tools', route: '/text-tools' },
    { icon: '🔒', label: 'Secure Files', route: '/secure-files' },
    { icon: '⚙️', label: 'Settings', route: '/settings' }
  ];
}
