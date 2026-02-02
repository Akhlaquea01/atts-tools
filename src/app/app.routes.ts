import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/crypto',
        pathMatch: 'full'
    },
    {
        path: 'crypto',
        loadChildren: () => import('./features/crypto/crypto.routes').then(m => m.CRYPTO_ROUTES)
    },
    {
        path: 'json-tools',
        loadChildren: () => import('./features/json-tools/json-tools.routes').then(m => m.JSON_TOOLS_ROUTES)
    },
    {
        path: 'text-tools',
        loadChildren: () => import('./features/text-tools/text-tools.routes').then(m => m.TEXT_TOOLS_ROUTES)
    },
    {
        path: 'secure-files',
        loadChildren: () => import('./features/secure-files/secure-files.routes').then(m => m.SECURE_FILES_ROUTES)
    },
    {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
    },
    {
        path: '**',
        redirectTo: '/crypto'
    }
];
