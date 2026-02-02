import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-file-crypto',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="tool-container">
      <h2>🔐 File Encryption</h2>
      <p class="text-muted">Coming soon: Encrypt large files with streaming support</p>
    </div>
  `,
    styles: [`
    .tool-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: var(--surface);
      border-radius: 0.5rem;
    }
  `]
})
export class FileCryptoComponent { }
