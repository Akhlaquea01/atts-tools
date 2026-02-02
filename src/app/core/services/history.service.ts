import { Injectable, signal } from '@angular/core';

export interface HistoryEntry {
    id: string;
    timestamp: Date;
    tool: string;
    action: string;
    details?: string;
}

/**
 * HistoryService tracks user actions across different tools
 * Provides convenience features like recent actions and quick access
 * History is stored in memory only (not persisted)
 */
@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private readonly MAX_HISTORY_SIZE = 50;

    // Using signals for reactive history
    history = signal<HistoryEntry[]>([]);

    /**
     * Add an entry to history
     */
    addEntry(tool: string, action: string, details?: string): void {
        const entry: HistoryEntry = {
            id: this.generateId(),
            timestamp: new Date(),
            tool,
            action,
            details
        };

        this.history.update(current => {
            const updated = [entry, ...current];
            // Keep only the most recent entries
            return updated.slice(0, this.MAX_HISTORY_SIZE);
        });
    }

    /**
     * Clear all history
     */
    clearHistory(): void {
        this.history.set([]);
    }

    /**
     * Get history entries for a specific tool
     */
    getHistoryForTool(tool: string): HistoryEntry[] {
        return this.history().filter(entry => entry.tool === tool);
    }

    /**
     * Generate a unique ID for history entries
     */
    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
