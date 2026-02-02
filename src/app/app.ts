import { Component } from '@angular/core';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';

@Component({
  selector: 'app-root',
  imports: [AppShellComponent],
  template: '<app-shell />',
  standalone: true
})
export class App { }
