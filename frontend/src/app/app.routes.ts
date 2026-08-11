import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'change-password',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/change-password/change-password').then(m => m.ChangePassword)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    children: [
      {
        path: 'issues',
        loadComponent: () => import('./pages/issues/issues').then(m => m.Issues)
      },
      {
        path: 'issues/new',
        loadComponent: () => import('./pages/issue-create/issue-create').then(m => m.IssueCreate)
      },
      {
        path: 'issues/:id',
        loadComponent: () => import('./pages/issue-detail/issue-detail').then(m => m.IssueDetail)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'issues'
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'issues'
  },
];
