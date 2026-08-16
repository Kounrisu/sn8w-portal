import type { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing-page/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-page/admin-page').then((m) => m.AdminPage),
    canActivate: [authGuard],
  },
  {
    path: 'todo',
    loadComponent: () => import('./pages/todo-page/todo-page').then((m) => m.TodoPage),
    canActivate: [authGuard],
  },
  {
    path: 'diary',
    loadComponent: () => import('./pages/diary-page/diary-page').then((m) => m.DiaryPage),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
