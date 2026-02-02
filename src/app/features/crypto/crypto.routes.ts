import { Routes } from '@angular/router';

export const CRYPTO_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'text-crypto',
        pathMatch: 'full'
    },
    {
        path: 'text-crypto',
        loadComponent: () => import('./components/text-crypto/text-crypto.component').then(m => m.TextCryptoComponent)
    },
    {
        path: 'file-crypto',
        loadComponent: () => import('./components/file-crypto/file-crypto.component').then(m => m.FileCryptoComponent)
    },
    {
        path: 'secure-notes',
        loadComponent: () => import('./components/secure-notes/secure-notes.component').then(m => m.SecureNotesComponent)
    }
];
