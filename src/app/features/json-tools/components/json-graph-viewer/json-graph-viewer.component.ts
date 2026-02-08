import { Component, ElementRef, ViewChild, signal, effect, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createRoot, Root } from 'react-dom/client';
import * as React from 'react';

// Use require or dynamic import if direct import fails?
// Standard import should work with proper TS config.
import JsonGraph from './JsonGraph';

@Component({
  selector: 'app-json-graph-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './json-graph-viewer.component.html',
  styleUrl: './json-graph-viewer.component.scss'
})
export class JsonGraphViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('reactRoot', { static: true }) reactRoot!: ElementRef<HTMLDivElement>;

  inputJson = signal('');
  error = signal('');

  private root: Root | null = null;

  constructor() {
    effect(() => {
      const json = this.inputJson();
      // We need to defer rendering until view init?
      // effect runs early. But we check this.root.
      if (this.root) {
        this.renderGraph(json);
      }
    });
  }

  ngAfterViewInit() {
    if (this.reactRoot && !this.root) {
      this.root = createRoot(this.reactRoot.nativeElement);
      // Trigger initial render
      this.renderGraph(this.inputJson());
    }
  }

  renderGraph(jsonString: string) {
    if (!this.root) return;

    let parsedJson = null;
    try {
        if (jsonString.trim()) {
            parsedJson = JSON.parse(jsonString);
            this.error.set('');
        }
    } catch (e: any) {
        this.error.set(e.message);
        // Don't render invalid JSON, or clear graph
        parsedJson = null;
    }

    this.root.render(React.createElement(JsonGraph, { json: parsedJson }));
  }

  ngOnDestroy() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  onInputChange(val: string) {
      this.inputJson.set(val);
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
  }

  clear() {
    this.inputJson.set('');
    this.error.set('');
  }
}
