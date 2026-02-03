import { Component } from '@angular/core';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';
import { ToastContainerComponent } from './core/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [AppShellComponent, ToastContainerComponent],
  template: `
    <app-shell />
    <app-toast-container />
  `,
  standalone: true
})
export class App { }
