import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@Component({
  selector: 'app-json-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxJsonViewerModule],
  templateUrl: './json-viewer.component.html',
  styleUrl: './json-viewer.component.scss'
})
export class JsonViewerComponent {
  inputJson = signal('');
  parsedJson: any = null;
  error = signal('');

  onInputChange() {
    this.error.set('');
    const input = this.inputJson().trim();
    if (!input) {
      this.parsedJson = null;
      return;
    }
    try {
      this.parsedJson = JSON.parse(input);
    } catch (e: any) {
      // Don't clear parsedJson immediately on every keystroke if it was valid before?
      // Actually, for a viewer, we probably want to show error and maybe clear view or keep last valid.
      // I'll show error and clear view to avoid confusion.
      this.error.set(e.message);
      this.parsedJson = null;
    }
  }

  loadSample() {
    const sample = {
      "name": "jsontree",
      "version": "0.1.0",
      "private": true,
      "authors": [
        {
          "name": "Amit Chauhan",
          "email": "amitchauhan263871@gmail.com"
        }
      ],
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "prepare": "husky install"
      },
      "dependencies": {
        "@headlessui/react": "^1.7.15",
        "@monaco-editor/react": "^4.5.1",
        "react": "^18.2.0"
      }
    };
    this.inputJson.set(JSON.stringify(sample, null, 2));
    this.onInputChange();
  }

  clear() {
    this.inputJson.set('');
    this.parsedJson = null;
    this.error.set('');
  }
}
