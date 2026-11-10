import { Routes } from '@angular/router';

import { STRINGS } from './mocks/strings';

export const routes: Routes = [
  {
    path: 'welcome',
    title: STRINGS.welcome.pageTitle,
    loadComponent: () => import('./screens/welcome').then((m) => m.Welcome),
  },
  {
    path: '',
    loadComponent: () => import('./screens/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: STRINGS.brand,
        loadComponent: () => import('./screens/home').then((m) => m.Home),
      },
      {
        path: 'tasks',
        title: STRINGS.nav.tasks,
        loadComponent: () => import('./screens/tasks').then((m) => m.Tasks),
      },
      {
        path: 'settings',
        title: STRINGS.nav.settings,
        loadComponent: () => import('./screens/settings').then((m) => m.Settings),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
