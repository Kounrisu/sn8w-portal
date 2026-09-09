import type { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing-page/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'behind-the-scenes',
    loadComponent: () =>
      import('./pages/behind-the-scenes-page/behind-the-scenes-page').then(
        (m) => m.BehindTheScenesPage,
      ),
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
    path: 'todo/new',
    loadComponent: () =>
      import('./pages/todo-detail-page/todo-detail-page').then((m) => m.TodoDetailPage),
    canActivate: [authGuard],
  },
  {
    path: 'todo/:id',
    loadComponent: () =>
      import('./pages/todo-detail-page/todo-detail-page').then((m) => m.TodoDetailPage),
    canActivate: [authGuard],
  },
  {
    path: 'diary',
    loadComponent: () => import('./pages/diary-page/diary-page').then((m) => m.DiaryPage),
    canActivate: [authGuard],
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./pages/analytics-page/analytics-page').then((m) => m.AnalyticsPage),
    canActivate: [authGuard],
  },
  {
    path: 'accessibilite',
    loadComponent: () =>
      import('./pages/accessibility-page/accessibility-page').then((m) => m.AccessibilityPage),
  },
  {
    path: 'plan-du-site',
    loadComponent: () => import('./pages/sitemap-page/sitemap-page').then((m) => m.SitemapPage),
  },
  { path: '**', redirectTo: '' },
];
