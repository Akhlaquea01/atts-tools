import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-secure-notes',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="tool-container">
      <h2>📝 Secure Notes</h2>
      <p class="text-muted">Coming soon: Store encrypted notes locally</p>
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
export class SecureNotesComponent { }
