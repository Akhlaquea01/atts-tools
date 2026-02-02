import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as Papa from 'papaparse';

@Component({
    selector: 'app-json-to-csv',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './json-to-csv.component.html',
    styleUrl: './json-to-csv.component.css'
})
export class JsonToCsvComponent {
    inputText = signal('');
    outputText = signal('');
    error = signal('');
    mode = signal<'json-to-csv' | 'csv-to-json'>('json-to-csv');
    delimiter = signal(',');
    includeHeaders = signal(true);

    jsonToCsv() {
        this.error.set('');
        try {
            const parsed = JSON.parse(this.inputText());

            // Handle both array and single object
            const data = Array.isArray(parsed) ? parsed : [parsed];

            // Flatten nested objects
            const flattened = data.map(item => this.flattenObject(item));

            const csv = Papa.unparse(flattened, {
                delimiter: this.delimiter(),
                header: this.includeHeaders(),
                skipEmptyLines: true
            });

            this.outputText.set(csv);
        } catch (e: any) {
            this.error.set('Error: ' + e.message);
        }
    }

    csvToJson() {
        this.error.set('');
        try {
            const result = Papa.parse(this.inputText(), {
                header: this.includeHeaders(),
                delimiter: this.delimiter(),
                skipEmptyLines: true,
                dynamicTyping: true
            });

            if (result.errors.length > 0) {
                this.error.set('CSV parsing errors: ' + result.errors.map(e => e.message).join(', '));
                return;
            }

            const json = JSON.stringify(result.data, null, 2);
            this.outputText.set(json);
        } catch (e: any) {
            this.error.set('Error: ' + e.message);
        }
    }

    convert() {
        if (this.mode() === 'json-to-csv') {
            this.jsonToCsv();
        } else {
            this.csvToJson();
        }
    }

    toggleMode() {
        this.mode.set(this.mode() === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv');
        this.inputText.set('');
        this.outputText.set('');
        this.error.set('');
    }

    private flattenObject(obj: any, prefix = ''): any {
        const flattened: any = {};

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                const newKey = prefix ? `${prefix}.${key}` : key;

                if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                    Object.assign(flattened, this.flattenObject(value, newKey));
                } else if (Array.isArray(value)) {
                    flattened[newKey] = JSON.stringify(value);
                } else {
                    flattened[newKey] = value;
                }
            }
        }

        return flattened;
    }

    copyToClipboard() {
        if (this.outputText()) {
            navigator.clipboard.writeText(this.outputText());
        }
    }

    downloadFile() {
        const extension = this.mode() === 'json-to-csv' ? 'csv' : 'json';
        const mimeType = this.mode() === 'json-to-csv' ? 'text/csv' : 'application/json';

        const blob = new Blob([this.outputText()], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
    }

    loadSample() {
        if (this.mode() === 'json-to-csv') {
            const sample = [
                { "id": 1, "name": "Alice", "email": "alice@example.com", "age": 28 },
                { "id": 2, "name": "Bob", "email": "bob@example.com", "age": 32 },
                { "id": 3, "name": "Charlie", "email": "charlie@example.com", "age": 25 }
            ];
            this.inputText.set(JSON.stringify(sample, null, 2));
        } else {
            const sample = `id,name,email,age
1,Alice,alice@example.com,28
2,Bob,bob@example.com,32
3,Charlie,charlie@example.com,25`;
            this.inputText.set(sample);
        }
    }

    clearAll() {
        this.inputText.set('');
        this.outputText.set('');
        this.error.set('');
    }
}
