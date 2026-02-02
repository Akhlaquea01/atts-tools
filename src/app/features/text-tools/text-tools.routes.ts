import { Routes } from '@angular/router';

export const TEXT_TOOLS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'case-converter',
    pathMatch: 'full'
  },
  {
    path: 'case-converter',
    loadComponent: () => import('./components/case-converter/case-converter.component').then(m => m.CaseConverterComponent)
  },
  {
    path: 'word-counter',
    loadComponent: () => import('./components/word-counter/word-counter.component').then(m => m.WordCounterComponent)
  },
  {
    path: 'regex-tester',
    loadComponent: () => import('./components/regex-tester/regex-tester.component').then(m => m.RegexTesterComponent)
  },
  {
    path: 'uuid-generator',
    loadComponent: () => import('./components/uuid-generator/uuid-generator.component').then(m => m.UuidGeneratorComponent)
  },
  {
    path: 'password-generator',
    loadComponent: () => import('./components/password-generator/password-generator.component').then(m => m.PasswordGeneratorComponent)
  },
  {
    path: 'text-diff',
    loadComponent: () => import('./components/text-diff/text-diff.component').then(m => m.TextDiffComponent)
  },
  {
    path: 'lorem-ipsum',
    loadComponent: () => import('./components/lorem-ipsum/lorem-ipsum.component').then(m => m.LoremIpsumComponent)
  }
];

