import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { I18nService } from './i18n/i18n.service';
import { isTrackingOptedOut, setTrackingOptOut } from './tracking-opt-out';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID_PATTERN = /^G-[A-Z0-9]{6,}$/;
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

  private gaLoaded = false;

  constructor() {
    if (typeof document === 'undefined') return;
    this.applyNoTrackParam();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.flushDuration();
    });
    window.addEventListener('pagehide', () => this.flushDuration());
  }

  /** Call on every route change (including the initial load). */
  trackPageview(path: string): void {
    this.flushDuration();
    if (isTrackingOptedOut()) return;
    this.sendToGoogle('page_view', {
      page_path: path,
      page_location: typeof location !== 'undefined' ? location.href : undefined,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
    });

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
    if (isTrackingOptedOut()) return;
    // GA4 event names allow letters, digits and underscores only.
    this.sendToGoogle(kind.replace(/[^a-zA-Z0-9_]/g, '_'), { label });
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

  /** `/?notrack=1` stops counting this browser, `/?notrack=0` counts it again. */
  private applyNoTrackParam(): void {
    const value = new URLSearchParams(location.search).get('notrack');
    if (value === '1') setTrackingOptOut(true);
    else if (value === '0') setTrackingOptOut(false);
  }

  /**
   * Google Analytics 4: only in production, only when a valid measurement id
   * is configured, and never for a browser that opted out or sends Do Not
   * Track. The gtag script is loaded lazily on the first event.
   */
  private googleEnabled(): boolean {
    const id = environment.googleAnalyticsId;
    if (!environment.production || !GA_ID_PATTERN.test(id)) return false;
    if (isTrackingOptedOut()) return false;
    return !(typeof navigator !== 'undefined' && navigator.doNotTrack === '1');
  }

  private loadGoogle(): void {
    if (this.gaLoaded) return;
    this.gaLoaded = true;
    const id = environment.googleAnalyticsId;
    window.dataLayer = window.dataLayer ?? [];
    // gtag pushes the `arguments` object itself, which a rest-parameter array would break.
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      (window.dataLayer as unknown[]).push(arguments);
    };
    window.gtag('js', new Date());
    // The app is a single page: page views are sent by hand on every route change.
    window.gtag('config', id, { send_page_view: false });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
  }

  private sendToGoogle(name: string, params: Record<string, unknown>): void {
    if (!this.googleEnabled()) return;
    this.loadGoogle();
    window.gtag?.('event', name, params);
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
