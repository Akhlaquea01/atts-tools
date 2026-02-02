import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-case-converter',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="tool-container">
      <h2>🔤 Case Converter</h2>

      <div class="editor-section">
        <textarea
          [(ngModel)]="inputText"
          (ngModelChange)="convertAll()"
          placeholder="Enter text to convert..."
          class="text-editor"
          rows="6"
        ></textarea>
      </div>

      <div class="conversions">
        <div class="conversion-item" *ngFor="let conv of conversions()">
          <div class="conversion-header">
            <strong>{{ conv.label }}</strong>
            <button (click)="copy(conv.value)" class="btn-copy">📋</button>
          </div>
          <div class="conversion-output">{{ conv.value }}</div>
        </div>
      </div>

      <div class="actions">
        <button (click)="reverseText()" class="btn-secondary">🔄 Reverse</button>
        <button (click)="sortLines()" class="btn-secondary">🔤 Sort Lines</button>
        <button (click)="removeDuplicates()" class="btn-secondary">Remove Duplicates</button>
        <button (click)="inputText.set('')" class="btn-secondary">Clear</button>
      </div>
    </div>
  `,
    styles: [`
    .tool-container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    h2 { margin-bottom: 1.5rem; }
    .editor-section { margin-bottom: 1.5rem; }
    .text-editor { width: 100%; padding: 1rem; background: var(--background); border: 1px solid var(--border);
      border-radius: 0.25rem; font-family: 'Courier New', monospace; font-size: 0.875rem; resize: vertical; }
    .conversions { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .conversion-item { background: var(--surface); padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--border); }
    .conversion-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .conversion-output { font-family: 'Courier New', monospace; font-size: 0.875rem; word-break: break-all; }
    .btn-copy { padding: 0.25rem 0.5rem; background: var(--primary); color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; }
    .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-secondary { padding: 0.5rem 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 0.25rem; cursor: pointer; }
  `]
})
export class CaseConverterComponent {
    inputText = signal('');

    conversions = computed(() => {
        const text = this.inputText();
        return [
            { label: 'UPPERCASE', value: text.toUpperCase() },
            { label: 'lowercase', value: text.toLowerCase() },
            { label: 'Title Case', value: this.toTitleCase(text) },
            { label: 'Sentence case', value: this.toSentenceCase(text) },
            { label: 'camelCase', value: this.toCamelCase(text) },
            { label: 'PascalCase', value: this.toPascalCase(text) },
            { label: 'snake_case', value: this.toSnakeCase(text) },
            { label: 'kebab-case', value: this.toKebabCase(text) },
            { label: 'CONSTANT_CASE', value: this.toConstantCase(text) }
        ];
    });

    convertAll() { }

    private toTitleCase(str: string): string {
        return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    }

    private toSentenceCase(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    private toCamelCase(str: string): string {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
            index === 0 ? match.toLowerCase() : match.toUpperCase()).replace(/\s+/g, '');
    }

    private toPascalCase(str: string): string {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, match => match.toUpperCase()).replace(/\s+/g, '');
    }

    private toSnakeCase(str: string): string {
        return str.replace(/\W+/g, ' ').trim().replace(/\s+/g, '_').toLowerCase();
    }

    private toKebabCase(str: string): string {
        return str.replace(/\W+/g, ' ').trim().replace(/\s+/g, '-').toLowerCase();
    }

    private toConstantCase(str: string): string {
        return str.replace(/\W+/g, ' ').trim().replace(/\s+/g, '_').toUpperCase();
    }

    copy(text: string) {
        navigator.clipboard.writeText(text);
    }

    reverseText() {
        this.inputText.set(this.inputText().split('').reverse().join(''));
    }

    sortLines() {
        const lines = this.inputText().split('\n').sort();
        this.inputText.set(lines.join('\n'));
    }

    removeDuplicates() {
        const lines = [...new Set(this.inputText().split('\n'))];
        this.inputText.set(lines.join('\n'));
    }
}
