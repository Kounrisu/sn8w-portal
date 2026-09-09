import { Injectable, inject } from '@angular/core';
import { I18nService } from './i18n/i18n.service';

const SESSION_KEY = 'sn8w-analytics-sid';
const TRACK_URL = '/api/track.php';

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers — good enough for a non-cryptographic,
  // purely-local visit correlation id.
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sessionId(): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/**
 * Self-hosted, cookie-free visit logging (see api/track.php and
 * api/migrations/006_page_views.sql) — pings its own endpoint with a
 * random client-generated id (not a cookie, no PII). Every call is
 * fire-and-forget and swallows its own errors: analytics must never be
 * able to break or slow down the site for a visitor.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly i18n = inject(I18nService);
  private pendingViewId: number | null = null;
  private viewStartedAt = 0;

  constructor() {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.flushDuration();
    });
    window.addEventListener('pagehide', () => this.flushDuration());
  }

  /** Call on every route change (including the initial load). */
  trackPageview(path: string): void {
    this.flushDuration();

    const sid = sessionId();
    if (sid === null || typeof fetch !== 'function') return;

    this.viewStartedAt = performance.now();
    fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        sessionId: sid,
        kind: 'pageview',
        path,
        referrer: typeof document !== 'undefined' ? document.referrer : null,
        lang: this.i18n.lang(),
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { id?: number } | null) => {
        this.pendingViewId = typeof data?.id === 'number' ? data.id : null;
      })
      .catch(() => {
        // A dropped analytics call is invisible to the visitor by design.
      });
  }

  /** Call on a project link click, etc. — fire-and-forget, no response needed. */
  trackEvent(kind: string, label?: string): void {
    const sid = sessionId();
    if (sid === null || typeof fetch !== 'function') return;

    fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ sessionId: sid, kind, label, lang: this.i18n.lang() }),
    }).catch(() => {
      // Same as above — never let this surface to the visitor.
    });
  }

  private flushDuration(): void {
    if (this.pendingViewId === null) return;
    const durationMs = Math.round(performance.now() - this.viewStartedAt);
    const payload = JSON.stringify({ id: this.pendingViewId, durationMs });
    this.pendingViewId = null;

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(TRACK_URL, new Blob([payload], { type: 'application/json' }));
      return;
    }
    if (typeof fetch === 'function') {
      fetch(TRACK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: payload }).catch(
        () => {},
      );
    }
  }
}
