import { Injectable, signal } from '@angular/core';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastIdCounter = 0;
    toasts = signal<Toast[]>([]);

    /**
     * Show a success toast
     */
    success(message: string, duration: number = 3000): void {
        this.show(message, 'success', duration);
    }

    /**
     * Show an error toast
     */
    error(message: string, duration: number = 5000): void {
        this.show(message, 'error', duration);
    }

    /**
     * Show an info toast
     */
    info(message: string, duration: number = 3000): void {
        this.show(message, 'info', duration);
    }

    /**
     * Show a warning toast
     */
    warning(message: string, duration: number = 4000): void {
        this.show(message, 'warning', duration);
    }

    /**
     * Show a toast with custom type
     */
    private show(message: string, type: Toast['type'], duration: number): void {
        // Prevent empty or whitespace-only messages
        if (!message || !message.trim()) {
            console.warn('ToastService: Attempted to show empty toast message');
            return;
        }

        const id = ++this.toastIdCounter;
        const toast: Toast = { id, message: message.trim(), type, duration };

        this.toasts.update(toasts => [...toasts, toast]);

        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
    }

    /**
     * Remove a toast by ID
     */
    remove(id: number): void {
        this.toasts.update(toasts => toasts.filter(t => t.id !== id));
    }

    /**
     * Clear all toasts
     */
    clearAll(): void {
        this.toasts.set([]);
    }
}
