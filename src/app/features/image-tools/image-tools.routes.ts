import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-image-tools-home',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="tool-container">
      <h2>🖼️ Image Tools</h2>
      <p class="text-muted">Compress, resize, format conversion, and EXIF removal coming soon</p>
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
export class ImageToolsHomeComponent { }

export const IMAGE_TOOLS_ROUTES: Routes = [
    {
        path: '',
        component: ImageToolsHomeComponent
    }
];
