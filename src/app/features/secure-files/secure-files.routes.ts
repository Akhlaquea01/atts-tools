import { Routes } from '@angular/router';

export const SECURE_FILES_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'vault',
        pathMatch: 'full'
    },
    {
        path: 'vault',
        loadComponent: () => import('./components/file-vault/file-vault.component').then(m => m.FileVaultComponent)
    }
];
