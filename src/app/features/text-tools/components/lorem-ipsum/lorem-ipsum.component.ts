import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-lorem-ipsum',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="tool-container">
      <h2>📄 Lorem Ipsum Generator</h2>

      <div class="controls-grid">
        <label>
          <span>Type:</span>
          <select [(ngModel)]="loremType" class="select-input">
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </label>

        <label>
          <span>Count:</span>
          <input type="number" [(ngModel)]="count" min="1" max="100" class="number-input">
        </label>

        <label>
          <span>Format:</span>
          <select [(ngModel)]="outputFormat" class="select-input">
            <option value="text">Plain Text</option>
            <option value="html">HTML</option>
          </select>
        </label>
      </div>

      <div class="actions">
        <button (click)="generate()" class="btn-primary">✨ Generate</button>
        <button (click)="copyText()" class="btn-secondary" [disabled]="!output()">📋 Copy</button>
        <button (click)="output.set('')" class="btn-secondary">Clear</button>
      </div>

      @if (output()) {
        <div class="output-section">
          <div class="output-stats">
            <span>Words: {{ stats().words }}</span>
            <span>Characters: {{ stats().characters }}</span>
          </div>
          <div class="output-text" [innerHTML]="displayOutput()"></div>
        </div>
      }
    </div>
  `,
    styles: [`
    .tool-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    h2 { margin-bottom: 1.5rem; }
    .controls-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;
      padding: 1.5rem; background: var(--surface); border-radius: 0.5rem; margin-bottom: 1rem; }
    .controls-grid label { display: flex; flex-direction: column; gap: 0.5rem; }
    .select-input, .number-input { padding: 0.5rem; background: var(--background); border: 1px solid var(--border);
      border-radius: 0.25rem; }
    .actions { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
    .btn-primary, .btn-secondary { padding: 0.625rem 1.25rem; border: none; border-radius: 0.25rem; cursor: pointer; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-secondary { background: var(--surface); border: 1px solid var(--border); }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
    .output-section { background: var(--surface); padding: 1.5rem; border-radius: 0.5rem; }
    .output-stats { display: flex; gap: 1.5rem; margin-bottom: 1rem; font-size: 0.875rem; color: var(--text-secondary); }
    .output-text { background: var(--background); padding: 1.5rem; border-radius: 0.25rem; line-height: 1.8; }
  `]
})
export class LoremIpsumComponent {
    loremType = signal('paragraphs');
    count = signal(3);
    outputFormat = signal('text');
    output = signal('');

    private loremWords = [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
        'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua',
        'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris',
        'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in',
        'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur',
        'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui',
        'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ];

    stats = signal({ words: 0, characters: 0 });

    generate() {
        let result = '';

        switch (this.loremType()) {
            case 'words':
                result = this.generateWords(this.count());
                break;
            case 'sentences':
                result = this.generateSentences(this.count());
                break;
            case 'paragraphs':
                result = this.generateParagraphs(this.count());
                break;
        }

        this.output.set(result);
        this.calculateStats(result);
    }

    private generateWords(count: number): string {
        const words = [];
        for (let i = 0; i < count; i++) {
            words.push(this.loremWords[Math.floor(Math.random() * this.loremWords.length)]);
        }
        return words.join(' ');
    }

    private generateSentences(count: number): string {
        const sentences = [];
        for (let i = 0; i < count; i++) {
            const wordCount = 10 + Math.floor(Math.random() * 10);
            const sentence = this.generateWords(wordCount);
            sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.');
        }
        return sentences.join(' ');
    }

    private generateParagraphs(count: number): string {
        const paragraphs = [];
        for (let i = 0; i < count; i++) {
            const sentenceCount = 3 + Math.floor(Math.random() * 4);
            paragraphs.push(this.generateSentences(sentenceCount));
        }
        return paragraphs.join('\n\n');
    }

    private calculateStats(text: string) {
        const words = text.trim().split(/\s+/).length;
        const characters = text.length;
        this.stats.set({ words, characters });
    }

    displayOutput() {
        if (this.outputFormat() === 'html') {
            const paragraphs = this.output().split('\n\n');
            return paragraphs.map(p => `<p>${p}</p>`).join('');
        }
        return this.output();
    }

    copyText() {
        navigator.clipboard.writeText(this.outputFormat() === 'html' ? this.displayOutput() : this.output());
    }
}
