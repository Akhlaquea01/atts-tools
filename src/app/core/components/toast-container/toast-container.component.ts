import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}">
          <div class="toast-content">
            <span class="toast-icon">{{ getIcon(toast.type) }}</span>
            <span class="toast-message">{{ toast.message }}</span>
          </div>
          <button
            class="toast-close"
            (click)="toastService.remove(toast.id)"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 420px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: var(--surface);
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--border);
      border-left: 4px solid;
      pointer-events: auto;
      animation: slideInRight 0.3s ease-out;
      min-width: 320px;
      max-width: 420px;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      min-width: 0;
    }

    .toast-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-size: 0.9375rem;
      font-weight: 500;
      line-height: 1.5;
      word-break: break-word;
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .toast-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: var(--text);
    }

    /* Toast type styles */
    .toast-success {
      border-left-color: #10b981;
      background: #1a2e25;
    }

    .toast-success .toast-icon {
      color: #10b981;
    }

    .toast-error {
      border-left-color: #ef4444;
      background: #2d1a1a;
    }

    .toast-error .toast-icon {
      color: #ef4444;
    }

    .toast-warning {
      border-left-color: #f59e0b;
      background: #2d2315;
    }

    .toast-warning .toast-icon {
      color: #f59e0b;
    }

    .toast-info {
      border-left-color: #3b82f6;
      background: #1a2332;
    }

    .toast-info .toast-icon {
      color: #3b82f6;
    }

    /* Light theme overrides */
    :root .toast-success {
      background: #f0fdf4;
    }

    :root .toast-error {
      background: #fef2f2;
    }

    :root .toast-warning {
      background: #fffbeb;
    }

    :root .toast-info {
      background: #eff6ff;
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      .toast-container {
        left: 1rem;
        right: 1rem;
        max-width: none;
      }

      .toast {
        min-width: auto;
        max-width: none;
        width: 100%;
      }
    }
  `]
})
export class ToastContainerComponent {
    toastService = inject(ToastService);

    getIcon(type: string): string {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info': return 'ℹ';
            default: return 'ℹ';
        }
    }
}
