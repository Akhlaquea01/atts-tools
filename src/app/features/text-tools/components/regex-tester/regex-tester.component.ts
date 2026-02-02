import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-regex-tester',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="tool-container">
      <h2>🔍 Regex Tester</h2>

      <div class="pattern-section">
        <label>Regular Expression Pattern</label>
        <div class="regex-input-group">
          <input type="text" [(ngModel)]="pattern" placeholder="Enter regex pattern" class="pattern-input">
          <div class="flags">
            <label><input type="checkbox" [(ngModel)]="globalFlag"> g</label>
            <label><input type="checkbox" [(ngModel)]="caseInsensitiveFlag"> i</label>
            <label><input type="checkbox" [(ngModel)]="multilineFlag"> m</label>
          </div>
        </div>
        <div class="common-patterns">
          <span>Common: </span>
          <button (click)="loadPattern('email')" class="btn-pattern">Email</button>
          <button (click)="loadPattern('url')" class="btn-pattern">URL</button>
          <button (click)="loadPattern('phone')" class="btn-pattern">Phone</button>
          <button (click)="loadPattern('date')" class="btn-pattern">Date</button>
          <button (click)="loadPattern('ip')" class="btn-pattern">IP</button>
        </div>
      </div>

      <div class="test-section">
        <label>Test String</label>
        <textarea [(ngModel)]="testString" (ngModelChange)="test()" placeholder="Enter text to test..." class="test-input" rows="8"></textarea>
      </div>

      <button (click)="test()" class="btn-primary">Test Regex</button>

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      @if (matches().length > 0) {
        <div class="results">
          <h3>Matches Found: {{ matches().length }}</h3>
          <div class="matches-list">
            <div class="match-item" *ngFor="let match of matches(); let i = index">
              <strong>Match {{ i + 1 }}:</strong> "{{ match.text }}" @if (match.groups.length > 0) {
                <div class="groups">Groups: {{ match.groups.join(', ') }}</div>
              }
            </div>
          </div>
        </div>
      } @else if (!error() && testString()) {
        <div class="no-matches">No matches found</div>
      }
    </div>
  `,
    styles: [`
    .tool-container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    h2 { margin-bottom: 1.5rem; }
    .pattern-section, .test-section { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .regex-input-group { display: flex; gap: 1rem; align-items: center; }
    .pattern-input, .test-input { width: 100%; padding: 0.75rem; background: var(--background); border: 1px solid var(--border);
      border-radius: 0.25rem; font-family: 'Courier New', monospace; }
    .test-input { font-family: inherit; }
    .flags { display: flex; gap: 1rem; }
    .flags label { margin: 0; display: flex; align-items: center; gap: 0.25rem; font-weight: normal; }
    .common-patterns { margin-top: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
    .btn-pattern { padding: 0.375rem 0.75rem; background: var(--surface); border: 1px solid var(--border); border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; }
    .btn-primary { padding: 0.75rem 1.5rem; background: var(--primary); color: white; border: none; border-radius: 0.25rem; cursor: pointer; margin-bottom: 1rem; }
    .error { padding: 1rem; background: #fee; color: #c00; border-radius: 0.25rem; margin-bottom: 1rem; }
    .results { background: var(--surface); padding: 1.5rem; border-radius: 0.5rem; }
    .matches-list { margin-top: 1rem; }
    .match-item { padding: 0.75rem; background: var(--background); border-radius: 0.25rem; margin-bottom: 0.5rem; }
    .groups { margin-top: 0.25rem; font-size: 0.875rem; color: var(--text-secondary); }
    .no-matches { padding: 1rem; background: var(--surface); border-radius: 0.25rem; text-align: center; color: var(--text-secondary); }
  `]
})
export class RegexTesterComponent {
    pattern = signal('');
    testString = signal('');
    globalFlag = signal(true);
    caseInsensitiveFlag = signal(false);
    multilineFlag = signal(false);
    matches = signal<{ text: string; groups: string[] }[]>([]);
    error = signal('');

    test() {
        this.error.set('');
        this.matches.set([]);

        try {
            const flags = `${this.globalFlag() ? 'g' : ''}${this.caseInsensitiveFlag() ? 'i' : ''}${this.multilineFlag() ? 'm' : ''}`;
            const regex = new RegExp(this.pattern(), flags);
            const results: { text: string; groups: string[] }[] = [];

            let match;
            const text = this.testString();

            if (this.globalFlag()) {
                while ((match = regex.exec(text)) !== null) {
                    results.push({
                        text: match[0],
                        groups: match.slice(1).filter(g => g !== undefined)
                    });
                }
            } else {
                match = regex.exec(text);
                if (match) {
                    results.push({
                        text: match[0],
                        groups: match.slice(1).filter(g => g !== undefined)
                    });
                }
            }

            this.matches.set(results);
        } catch (e: any) {
            this.error.set('Invalid regex: ' + e.message);
        }
    }

    loadPattern(type: string) {
        const patterns: { [key: string]: string } = {
            email: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
            url: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
            phone: '\\(?(\\d{3})\\)?[-.\\s]?(\\d{3})[-.\\s]?(\\d{4})',
            date: '\\d{4}-\\d{2}-\\d{2}',
            ip: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b'
        };
        this.pattern.set(patterns[type] || '');
    }
}
