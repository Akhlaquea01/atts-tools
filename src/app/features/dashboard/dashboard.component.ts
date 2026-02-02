import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ToolCard {
    icon: string;
    title: string;
    description: string;
    route: string;
    category: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Utility Toolbox</h1>
        <p class="text-muted">
          Browser-based productivity and security tools. All processing happens locally in your browser.
        </p>
      </header>

      <div class="tools-grid">
        @for (tool of tools; track tool.route) {
          <a [routerLink]="tool.route" class="tool-card">
            <div class="tool-icon">{{ tool.icon }}</div>
            <h3 class="tool-title">{{ tool.title }}</h3>
            <p class="tool-description">{{ tool.description }}</p>
            <span class="tool-category">{{ tool.category }}</span>
          </a>
        }
      </div>
    </div>
  `,
    styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 3rem;
      text-align: center;
    }

    .dashboard-header h1 {
      margin-bottom: 0.5rem;
      font-size: 2.5rem;
      background: linear-gradient(135deg, var(--primary) 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .tool-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 2rem;
      text-decoration: none;
      color: var(--text);
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }

    .tool-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), #ec4899);
      transform: scaleX(0);
      transition: transform 0.3s;
    }

    .tool-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary);
    }

    .tool-card:hover::before {
      transform: scaleX(1);
    }

    .tool-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .tool-title {
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
    }

    .tool-description {
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .tool-category {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: var(--primary-bg);
      color: var(--primary);
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 640px) {
      .tools-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent {
    tools: ToolCard[] = [
        {
            icon: '🔐',
            title: 'Text Encryption',
            description: 'Encrypt and decrypt text using AES-256 encryption with password protection',
            route: '/crypto/text-crypto',
            category: 'Crypto'
        },
        {
            icon: '📦',
            title: 'File Encryption',
            description: 'Encrypt large files with streaming support for GB+ files',
            route: '/crypto/file-crypto',
            category: 'Crypto'
        },
        {
            icon: '📝',
            title: 'Secure Notes',
            description: 'Store encrypted notes locally in your browser',
            route: '/crypto/secure-notes',
            category: 'Crypto'
        },
        {
            icon: '🌳',
            title: 'JSON Viewer',
            description: 'Visualize and explore JSON data with tree view',
            route: '/json-tools',
            category: 'JSON'
        },
        {
            icon: '✨',
            title: 'JSON Formatter',
            description: 'Beautify or minify JSON data',
            route: '/json-tools',
            category: 'JSON'
        },
        {
            icon: '📄',
            title: 'Text Tools',
            description: 'Case conversion, word count, regex testing, and more',
            route: '/text-tools',
            category: 'Text'
        },
        {
            icon: '#️⃣',
            title: 'Hash Generator',
            description: 'Generate MD5, SHA-1, SHA-256 hashes for files',
            route: '/file-utilities',
            category: 'Files'
        },
        {
            icon: '🖼️',
            title: 'Image Tools',
            description: 'Compress, resize, convert, and remove EXIF data from images',
            route: '/image-tools',
            category: 'Images'
        }
    ];
}
