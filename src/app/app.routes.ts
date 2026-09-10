import type { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing-page/landing-page').then((m) => m.LandingPage),
    data: { titleKey: 'home' },
  },
  {
    path: 'behind-the-scenes',
    loadComponent: () =>
      import('./pages/behind-the-scenes-page/behind-the-scenes-page').then(
        (m) => m.BehindTheScenesPage,
      ),
    data: { titleKey: 'behindTheScenes' },
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login-page/login-page').then((m) => m.LoginPage),
    data: { titleKey: 'login' },
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-page/admin-page').then((m) => m.AdminPage),
    canActivate: [authGuard],
    data: { titleKey: 'admin' },
  },
  {
    path: 'todo',
    loadComponent: () => import('./pages/todo-page/todo-page').then((m) => m.TodoPage),
    canActivate: [authGuard],
    data: { titleKey: 'todo' },
  },
  {
    path: 'todo/new',
    loadComponent: () =>
      import('./pages/todo-detail-page/todo-detail-page').then((m) => m.TodoDetailPage),
    canActivate: [authGuard],
    data: { titleKey: 'todo' },
  },
  {
    path: 'todo/:id',
    loadComponent: () =>
      import('./pages/todo-detail-page/todo-detail-page').then((m) => m.TodoDetailPage),
    canActivate: [authGuard],
    data: { titleKey: 'todo' },
  },
  {
    path: 'diary',
    loadComponent: () => import('./pages/diary-page/diary-page').then((m) => m.DiaryPage),
    canActivate: [authGuard],
    data: { titleKey: 'diary' },
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./pages/analytics-page/analytics-page').then((m) => m.AnalyticsPage),
    canActivate: [authGuard],
    data: { titleKey: 'analytics' },
  },
  {
    path: 'accessibilite',
    loadComponent: () =>
      import('./pages/accessibility-page/accessibility-page').then((m) => m.AccessibilityPage),
    data: { titleKey: 'accessibilityStatement' },
  },
  {
    path: 'plan-du-site',
    loadComponent: () => import('./pages/sitemap-page/sitemap-page').then((m) => m.SitemapPage),
    data: { titleKey: 'sitemap' },
  },
  {
    path: 'workshop',
    loadComponent: () => import('./pages/workshop-page/workshop-page').then((m) => m.WorkshopPage),
    data: { titleKey: 'workshop' },
  },
  {
    path: 'parametres-accessibilite',
    loadComponent: () =>
      import('./pages/preferences-page/preferences-page').then((m) => m.PreferencesPage),
    data: { titleKey: 'preferences' },
  },
  { path: '**', redirectTo: '' },
];
