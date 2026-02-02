import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-text-diff',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="tool-container">
      <h2>📝 Text Diff Viewer</h2>

      <div class="dual-editor">
        <div class="editor-section">
          <h3>Original Text</h3>
          <textarea [(ngModel)]="leftText" placeholder="Enter original text..." class="text-editor" rows="12"></textarea>
        </div>
        <div class="editor-section">
          <h3>Modified Text</h3>
          <textarea [(ngModel)]="rightText" placeholder="Enter modified text..." class="text-editor" rows="12"></textarea>
        </div>
      </div>

      <div class="options">
        <label class="checkbox"><input type="checkbox" [(ngModel)]="ignoreWhitespace"> Ignore Whitespace</label>
        <label class="checkbox"><input type="checkbox" [(ngModel)]="ignoreCase"> Ignore Case</label>
      </div>

      <div class="actions">
        <button (click)="compare()" class="btn-primary">🔍 Compare</button>
        <button (click)="swap()" class="btn-secondary">↔️ Swap</button>
        <button (click)="clear()" class="btn-secondary">Clear</button>
      </div>

      @if (showResult()) {
        <div class="results">
          <h3>Differences</h3>
          <div class="diff-view">
            <div class="diff-line" *ngFor="let line of diffLines()" [class]="'diff-' + line.type">
              <span class="line-indicator">{{ line.indicator }}</span>
              <span class="line-content">{{ line.content }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .tool-container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
    .dual-editor { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .editor-section h3 { margin-bottom: 0.5rem; }
    .text-editor { width: 100%; padding: 0.75rem; background: var(--background); border: 1px solid var(--border);
      border-radius: 0.25rem; resize: vertical; }
    .options { display: flex; gap: 1.5rem; margin-bottom: 1rem; }
    .checkbox { display: flex; align-items: center; gap: 0.5rem; }
    .actions { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
    .btn-primary, .btn-secondary { padding: 0.625rem 1.25rem; border: none; border-radius: 0.25rem; cursor: pointer; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-secondary { background: var(--surface); border: 1px solid var(--border); }
    .results { background: var(--surface); padding: 1.5rem; border-radius: 0.5rem; }
    .diff-view { background: var(--background); padding: 1rem; border-radius: 0.25rem; font-family: 'Courier New', monospace;
      font-size: 0.875rem; max-height: 500px; overflow-y: auto; }
    .diff-line { display: flex; gap: 1rem; padding: 0.25rem 0; }
    .diff-added { background: #dfd; }
    .diff-removed { background: #fdd; }
    .diff-unchanged { background: transparent; }
    .line-indicator { width: 1.5rem; flex-shrink: 0; font-weight: bold; }
    .line-content { flex: 1; white-space: pre-wrap; word-break: break-all; }
    @media (max-width: 1024px) {
      .dual-editor { grid-template-columns: 1fr; }
    }
  `]
})
export class TextDiffComponent {
    leftText = signal('');
    rightText = signal('');
    ignoreWhitespace = signal(false);
    ignoreCase = signal(false);
    diffLines = signal<{ type: string; indicator: string; content: string }[]>([]);
    showResult = signal(false);

    compare() {
        const left = this.processText(this.leftText());
        const right = this.processText(this.rightText());

        const leftLines = left.split('\n');
        const rightLines = right.split('\n');

        const result: { type: string; indicator: string; content: string }[] = [];
        const maxLen = Math.max(leftLines.length, rightLines.length);

        for (let i = 0; i < maxLen; i++) {
            const leftLine = leftLines[i] || '';
            const rightLine = rightLines[i] || '';

            if (leftLine === rightLine) {
                result.push({ type: 'unchanged', indicator: ' ', content: leftLine });
            } else {
                if (leftLine && !rightLines.includes(leftLine)) {
                    result.push({ type: 'removed', indicator: '-', content: leftLine });
                }
                if (rightLine && !leftLines.includes(rightLine)) {
                    result.push({ type: 'added', indicator: '+', content: rightLine });
                }
            }
        }

        this.diffLines.set(result);
        this.showResult.set(true);
    }

    private processText(text: string): string {
        let processed = text;
        if (this.ignoreCase()) processed = processed.toLowerCase();
        if (this.ignoreWhitespace()) processed = processed.replace(/\s+/g, ' ').trim();
        return processed;
    }

    swap() {
        const temp = this.leftText();
        this.leftText.set(this.rightText());
        this.rightText.set(temp);
    }

    clear() {
        this.leftText.set('');
        this.rightText.set('');
        this.diffLines.set([]);
        this.showResult.set(false);
    }
}
