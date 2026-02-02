import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-json-tools-home',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="tool-container">
      <h2>📝 JSON Tools</h2>
      <p class="text-muted">JSON viewer, formatter, diff, CSV converter, and schema validator coming soon</p>
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
export class JsonToolsHomeComponent { }

export const JSON_TOOLS_ROUTES: Routes = [
    {
        path: '',
        component: JsonToolsHomeComponent
    }
];
