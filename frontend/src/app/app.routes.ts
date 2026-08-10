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
    pathMatch: 'full',
    redirectTo: 'login'
  },
];
