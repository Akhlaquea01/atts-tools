import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Highlight from 'highlight.js';

@Component({
    selector: 'app-json-formatter',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './json-formatter.component.html',
    styleUrl: './json-formatter.component.css'
})
export class JsonFormatterComponent {
    inputJson = signal('');
    outputJson = signal('');
    error = signal('');
    isValid = signal(false);
    stats = signal({ keys: 0, depth: 0, size: 0 });

    formatJson() {
        this.error.set('');
        try {
            const parsed = JSON.parse(this.inputJson());
            const formatted = JSON.stringify(parsed, null, 2);
            this.outputJson.set(formatted);
            this.isValid.set(true);
            this.calculateStats(parsed);
        } catch (e: any) {
            this.error.set(e.message);
            this.isValid.set(false);
        }
    }

    minifyJson() {
        this.error.set('');
        try {
            const parsed = JSON.parse(this.inputJson());
            const minified = JSON.stringify(parsed);
            this.outputJson.set(minified);
            this.isValid.set(true);
            this.calculateStats(parsed);
        } catch (e: any) {
            this.error.set(e.message);
            this.isValid.set(false);
        }
    }

    validateJson() {
        this.error.set('');
        try {
            JSON.parse(this.inputJson());
            this.isValid.set(true);
            this.error.set('✓ Valid JSON');
        } catch (e: any) {
            this.error.set('✗ ' + e.message);
            this.isValid.set(false);
        }
    }

    copyToClipboard() {
        if (this.outputJson()) {
            navigator.clipboard.writeText(this.outputJson());
        }
    }

    downloadJson() {
        const blob = new Blob([this.outputJson()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    escapeJson() {
        if (this.inputJson()) {
            const escaped = JSON.stringify(this.inputJson());
            this.outputJson.set(escaped);
        }
    }

    unescapeJson() {
        try {
            const unescaped = JSON.parse(this.inputJson());
            if (typeof unescaped === 'string') {
                this.outputJson.set(unescaped);
            }
        } catch (e: any) {
            this.error.set(e.message);
        }
    }

    sortKeys() {
        try {
            const parsed = JSON.parse(this.inputJson());
            const sorted = this.sortObjectKeys(parsed);
            this.outputJson.set(JSON.stringify(sorted, null, 2));
            this.isValid.set(true);
        } catch (e: any) {
            this.error.set(e.message);
        }
    }

    private sortObjectKeys(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map(item => this.sortObjectKeys(item));
        } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj)
                .sort()
                .reduce((result: any, key) => {
                    result[key] = this.sortObjectKeys(obj[key]);
                    return result;
                }, {});
        }
        return obj;
    }

    private calculateStats(obj: any) {
        const keys = this.countKeys(obj);
        const depth = this.getMaxDepth(obj);
        const size = this.outputJson().length;
        this.stats.set({ keys, depth, size });
    }

    private countKeys(obj: any): number {
        if (Array.isArray(obj)) {
            return obj.reduce((count, item) => count + this.countKeys(item), 0);
        } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj).length +
                Object.values(obj).reduce((count: number, value) => count + this.countKeys(value), 0);
        }
        return 0;
    }

    private getMaxDepth(obj: any, depth = 0): number {
        if (Array.isArray(obj)) {
            const depths = obj.map(item => this.getMaxDepth(item, depth + 1));
            return depths.length > 0 ? Math.max(...depths) : depth;
        } else if (obj !== null && typeof obj === 'object') {
            const depths = Object.values(obj).map(value => this.getMaxDepth(value, depth + 1));
            return depths.length > 0 ? Math.max(...depths) : depth;
        }
        return depth;
    }

    loadSample() {
        const sample = {
            "name": "John Doe",
            "age": 30,
            "email": "john@example.com",
            "address": {
                "street": "123 Main St",
                "city": "New York",
                "country": "USA"
            },
            "hobbies": ["reading", "gaming", "coding"]
        };
        this.inputJson.set(JSON.stringify(sample, null, 2));
    }

    clearAll() {
        this.inputJson.set('');
        this.outputJson.set('');
        this.error.set('');
        this.isValid.set(false);
    }
}
