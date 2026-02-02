import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
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
        path: 'file-utilities',
        loadChildren: () => import('./features/file-utilities/file-utilities.routes').then(m => m.FILE_UTILITIES_ROUTES)
    },
    {
        path: 'image-tools',
        loadChildren: () => import('./features/image-tools/image-tools.routes').then(m => m.IMAGE_TOOLS_ROUTES)
    },
    {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
    },
    {
        path: '**',
        redirectTo: '/dashboard'
    }
];
