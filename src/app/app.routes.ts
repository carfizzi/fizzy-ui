import { Routes } from '@angular/router';
import { DOCS } from './docs';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'introduction' },
  { path: 'introduction', title: 'Introduction · fizzy-ui', loadComponent: () => import('./pages/introduction').then((m) => m.IntroductionPage) },
  { path: 'installation', title: 'Installation · fizzy-ui', loadComponent: () => import('./pages/installation').then((m) => m.InstallationPage) },
  { path: 'theming', title: 'Theming · fizzy-ui', loadComponent: () => import('./pages/theming').then((m) => m.ThemingPage) },
  {
    path: 'components/:name',
    title: (route) => `${DOCS.find((d) => d.name === route.paramMap.get('name'))?.title ?? 'Not found'} · fizzy-ui`,
    loadComponent: () => import('./pages/component-page').then((m) => m.ComponentPage),
  },
  { path: '**', redirectTo: 'introduction' },
];
