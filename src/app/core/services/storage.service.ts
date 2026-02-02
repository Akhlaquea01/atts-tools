import { Injectable } from '@angular/core';
import localforage from 'localforage';

/**
 * StorageService provides a unified interface for client-side storage
 * Uses IndexedDB (via localforage) for large/complex data
 * Falls back to localStorage for simple key-value pairs
 *
 * SECURITY NOTE: This service only stores encrypted data for sensitive information
 * All encryption must be handled by the caller (e.g., CryptoService)
 */
@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private db: LocalForage;

    constructor() {
        // Initialize localforage (IndexedDB wrapper)
        this.db = localforage.createInstance({
            name: 'angular-toolbox',
            storeName: 'app_data',
            description: 'Offline-first utility toolbox storage'
        });
    }

    /**
     * Store data in IndexedDB (for large or complex data)
     */
    async setItem<T>(key: string, value: T): Promise<T> {
        try {
            return await this.db.setItem(key, value);
        } catch (error) {
            console.error(`Error storing item with key "${key}":`, error);
            throw error;
        }
    }

    /**
     * Retrieve data from IndexedDB
     */
    async getItem<T>(key: string): Promise<T | null> {
        try {
            return await this.db.getItem<T>(key);
        } catch (error) {
            console.error(`Error retrieving item with key "${key}":`, error);
            return null;
        }
    }

    /**
     * Remove data from IndexedDB
     */
    async removeItem(key: string): Promise<void> {
        try {
            await this.db.removeItem(key);
        } catch (error) {
            console.error(`Error removing item with key "${key}":`, error);
            throw error;
        }
    }

    /**
     * Clear all data from IndexedDB
     */
    async clear(): Promise<void> {
        try {
            await this.db.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw error;
        }
    }

    /**
     * Get all keys from IndexedDB
     */
    async keys(): Promise<string[]> {
        try {
            return await this.db.keys();
        } catch (error) {
            console.error('Error retrieving keys:', error);
            return [];
        }
    }

    /**
     * Get number of items in storage
     */
    async length(): Promise<number> {
        try {
            return await this.db.length();
        } catch (error) {
            console.error('Error getting storage length:', error);
            return 0;
        }
    }

    /**
     * Store simple data in localStorage (for small, simple values)
     */
    setLocalItem(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error(`Error storing to localStorage with key "${key}":`, error);
        }
    }

    /**
     * Retrieve simple data from localStorage
     */
    getLocalItem(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error(`Error retrieving from localStorage with key "${key}":`, error);
            return null;
        }
    }

    /**
     * Remove data from localStorage
     */
    removeLocalItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from localStorage with key "${key}":`, error);
        }
    }
}
