import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-word-counter',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="tool-container">
      <h2>📊 Word Counter & Text Analyzer</h2>

      <div class="editor-section">
        <textarea
          [(ngModel)]="inputText"
          (ngModelChange)="analyze()"
          placeholder="Enter or paste your text here..."
          class="text-editor"
          rows="12"
        ></textarea>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats().words }}</div>
          <div class="stat-label">Words</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats().characters }}</div>
          <div class="stat-label">Characters</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats().charactersNoSpaces }}</div>
          <div class="stat-label">Characters (no spaces)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats().sentences }}</div>
          <div class="stat-label">Sentences</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats().paragraphs }}</div>
          <div class="stat-label">Paragraphs</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats().lines }}</div>
          <div class="stat-label">Lines</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats().readingTime }}</div>
          <div class="stat-label">Reading Time (min)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats().speakingTime }}</div>
          <div class="stat-label">Speaking Time (min)</div>
        </div>
      </div>

      @if (stats().longestWord) {
        <div class="details">
          <p><strong>Longest Word:</strong> {{ stats().longestWord }}</p>
          <p><strong>Average Word Length:</strong> {{ stats().avgWordLength }} characters</p>
        </div>
      }
    </div>
  `,
    styles: [`
    .tool-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    h2 { margin-bottom: 1.5rem; }
    .editor-section { margin-bottom: 1.5rem; }
    .text-editor { width: 100%; padding: 1rem; background: var(--background); border: 1px solid var(--border);
      border-radius: 0.25rem; font-size: 1rem; line-height: 1.6; resize: vertical; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: var(--surface); padding: 1.5rem; border-radius: 0.5rem; text-align: center; border: 1px solid var(--border); }
    .stat-value { font-size: 2rem; font-weight: bold; color: var(--primary); }
    .stat-label { font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem; }
    .details { background: var(--surface); padding: 1rem; border-radius: 0.5rem; }
    .details p { margin: 0.5rem 0; }
  `]
})
export class WordCounterComponent {
    inputText = signal('');

    stats = computed(() => {
        const text = this.inputText();
        const words = text.trim() ? text.trim().split(/\s+/) : [];
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
        const lines = text.split('\n').filter(l => l.trim().length > 0);

        const longestWord = words.reduce((a, b) => a.length > b.length ? a : b, '');
        const avgWordLength = words.length > 0 ?
            (words.reduce((sum, word) => sum + word.length, 0) / words.length).toFixed(1) : 0;

        const readingTime = Math.ceil(words.length / 200); // 200 WPM
        const speakingTime = Math.ceil(words.length / 150); // 150 WPM

        return {
            words: words.length,
            characters: text.length,
            charactersNoSpaces: text.replace(/\s/g, '').length,
            sentences: sentences.length,
            paragraphs: paragraphs.length,
            lines: lines.length,
            longestWord,
            avgWordLength,
            readingTime,
            speakingTime
        };
    });

    analyze() { }
}
