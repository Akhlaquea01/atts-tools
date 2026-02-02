import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-text-tools-home',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="tool-container">
      <h2>📄 Text Tools</h2>
      <p class="text-muted">Case conversion, word count, regex tester, diff viewer, UUID/password generators coming soon</p>
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
export class TextToolsHomeComponent { }

export const TEXT_TOOLS_ROUTES: Routes = [
    {
        path: '',
        component: TextToolsHomeComponent
    }
];
