import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-file-utilities-home',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="tool-container">
      <h2>📁 File Utilities</h2>
      <p class="text-muted">Hash generator, file info viewer, splitter/merger, Base64 encoding coming soon</p>
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
export class FileUtilitiesHomeComponent { }

export const FILE_UTILITIES_ROUTES: Routes = [
    {
        path: '',
        component: FileUtilitiesHomeComponent
    }
];
