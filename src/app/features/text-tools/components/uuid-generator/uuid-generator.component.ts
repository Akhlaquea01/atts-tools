import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4, v1 as uuidv1, v5 as uuidv5, validate as uuidValidate } from 'uuid';

@Component({
    selector: 'app-uuid-generator',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="tool-container">
      <h2>🆔 UUID Generator</h2>

      <div class="controls">
        <div class="version-select">
          <label>
            <span>UUID Version:</span>
            <select [(ngModel)]="version" class="select-input">
              <option value="v4">Version 4 (Random)</option>
              <option value="v1">Version 1 (Timestamp)</option>
            </select>
          </label>
        </div>

        <div class="count-input">
          <label>
            <span>Count:</span>
            <input type="number" [(ngModel)]="count" min="1" max="1000" class="number-input">
          </label>
        </div>
      </div>

      <div class="actions">
        <button (click)="generate()" class="btn-primary">🎲 Generate UUIDs</button>
        <button (click)="copyAll()" class="btn-secondary" [disabled]="uuids().length === 0">📋 Copy All</button>
        <button (click)="exportToFile()" class="btn-secondary" [disabled]="uuids().length === 0">💾 Export</button>
        <button (click)="uuids.set([])" class="btn-secondary">Clear</button>
      </div>

      <div class="validator-section">
        <label>Validate UUID:</label>
        <div class="validator-group">
          <input type="text" [(ngModel)]="validateInput" placeholder="Paste UUID to validate..." class="validate-input">
          <button (click)="validate()" class="btn-secondary">✓ Validate</button>
        </div>
        @if (validationResult()) {
          <div class="validation-result" [class.valid]="isValidUuid()" [class.invalid]="!isValidUuid()">
            {{ validationResult() }}
          </div>
        }
      </div>

      @if (uuids().length > 0) {
        <div class="results">
          <h3>Generated UUIDs ({{ uuids().length }})</h3>
          <div class="uuid-list">
            <div class="uuid-item" *ngFor="let uuid of uuids()">
              <code>{{ uuid }}</code>
              <button (click)="copy(uuid)" class="btn-copy">📋</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .tool-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    h2 { margin-bottom: 1.5rem; }
    .controls { display: flex; gap: 2rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .controls label { display: flex; flex-direction: column; gap: 0.5rem; }
    .select-input, .number-input { padding: 0.5rem; background: var(--background); border: 1px solid var(--border); border-radius: 0.25rem; }
    .number-input { width: 100px; }
    .actions { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .btn-primary, .btn-secondary { padding: 0.625rem 1.25rem; border: none; border-radius: 0.25rem; cursor: pointer; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-secondary { background: var(--surface); border: 1px solid var(--border); }
    .btn-primary:hover { background: var(--primary-dark, #4f46e5); }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
    .validator-section { background: var(--surface); padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 1.5rem; }
    .validator-section label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .validator-group { display: flex; gap: 0.5rem; }
    .validate-input { flex: 1; padding: 0.5rem; background: var(--background); border: 1px solid var(--border); border-radius: 0.25rem; font-family: monospace; }
    .validation-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 0.25rem; font-family: monospace; }
    .validation-result.valid { background: #efe; color: #070; }
    .validation-result.invalid { background: #fee; color: #c00; }
    .results { background: var(--surface); padding: 1.5rem; border-radius: 0.5rem; }
    .uuid-list { max-height: 400px; overflow-y: auto; margin-top: 1rem; }
    .uuid-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--background);
      border-radius: 0.25rem; margin-bottom: 0.5rem; }
    .uuid-item code { font-family: 'Courier New', monospace; font-size: 0.875rem; }
    .btn-copy { padding: 0.375rem 0.625rem; background: var(--primary); color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; }
  `]
})
export class UuidGeneratorComponent {
    version = signal('v4');
    count = signal(10);
    uuids = signal<string[]>([]);
    validateInput = signal('');
    validationResult = signal('');
    isValidUuid = signal(false);

    generate() {
        const results: string[] = [];
        for (let i = 0; i < this.count(); i++) {
            results.push(this.version() === 'v1' ? uuidv1() : uuidv4());
        }
        this.uuids.set(results);
    }

    validate() {
        const uuid = this.validateInput().trim();
        if (uuidValidate(uuid)) {
            this.isValidUuid.set(true);
            this.validationResult.set('✓ Valid UUID');
        } else {
            this.isValidUuid.set(false);
            this.validationResult.set('✗ Invalid UUID');
        }
    }

    copy(uuid: string) {
        navigator.clipboard.writeText(uuid);
    }

    copyAll() {
        navigator.clipboard.writeText(this.uuids().join('\n'));
    }

    exportToFile() {
        const blob = new Blob([this.uuids().join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'uuids.txt';
        a.click();
        URL.revokeObjectURL(url);
    }
}
