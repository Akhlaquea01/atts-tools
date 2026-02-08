import { Routes } from '@angular/router';

export const JSON_TOOLS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'formatter',
    pathMatch: 'full'
  },
  {
    path: 'formatter',
    loadComponent: () => import('./components/json-formatter/json-formatter.component').then(m => m.JsonFormatterComponent)
  },
  {
    path: 'csv-converter',
    loadComponent: () => import('./components/json-to-csv/json-to-csv.component').then(m => m.JsonToCsvComponent)
  },
  {
    path: 'diff',
    loadComponent: () => import('./components/json-diff/json-diff.component').then(m => m.JsonDiffComponent)
  },
  {
    path: 'viewer',
    loadComponent: () => import('./components/json-viewer/json-viewer.component').then(m => m.JsonViewerComponent)
  }
];

