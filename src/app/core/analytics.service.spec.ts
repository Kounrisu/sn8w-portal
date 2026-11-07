import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AnalyticsService } from './analytics.service';
import { setTrackingOptOut } from './tracking-opt-out';
import { environment } from '../../environments/environment';

const GA_SCRIPT = 'script[src^="https://www.googletagmanager.com/gtag/js"]';

describe('AnalyticsService', () => {
  const realFetch = globalThis.fetch;
  const originalEnv = { production: environment.production, googleAnalyticsId: environment.googleAnalyticsId };
  let fetchMock: ReturnType<typeof vi.fn>;

  function create(): AnalyticsService {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    return TestBed.inject(AnalyticsService);
  }

  beforeEach(() => {
    fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: 1 }), { status: 200 }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    setTrackingOptOut(false);
    delete window.gtag;
    delete window.dataLayer;
    document.querySelectorAll(GA_SCRIPT).forEach((s) => s.remove());
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    environment.production = originalEnv.production;
    environment.googleAnalyticsId = originalEnv.googleAnalyticsId;
    setTrackingOptOut(false);
  });

  it('records a pageview in the self-hosted tracking', () => {
    create().trackPageview('/projects');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe('/api/track.php');
  });

  it('records nothing, self-hosted or Google, for a browser that opted out', () => {
    environment.production = true;
    environment.googleAnalyticsId = 'G-TEST123456';
    setTrackingOptOut(true);
    const analytics = create();
    analytics.trackPageview('/projects');
    analytics.trackEvent('project-visit', 'LotoKarma');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(document.querySelector(GA_SCRIPT)).toBeNull();
  });

  it('never loads Google Analytics without a valid measurement id', () => {
    environment.production = true;
    environment.googleAnalyticsId = '';
    const analytics = create();
    analytics.trackPageview('/');
    environment.googleAnalyticsId = 'not-an-id';
    analytics.trackPageview('/');
    expect(document.querySelector(GA_SCRIPT)).toBeNull();
  });

  it('never loads Google Analytics outside production', () => {
    environment.production = false;
    environment.googleAnalyticsId = 'G-TEST123456';
    create().trackPageview('/');
    expect(document.querySelector(GA_SCRIPT)).toBeNull();
  });

  it('loads Google Analytics in production with a valid id and sends the page view', () => {
    environment.production = true;
    environment.googleAnalyticsId = 'G-TEST123456';
    create().trackPageview('/projects');
    expect(document.querySelector(GA_SCRIPT)?.getAttribute('src')).toContain('id=G-TEST123456');
    const sent = (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));
    expect(sent.some((args) => args[0] === 'event' && args[1] === 'page_view')).toBe(true);
    expect(sent.some((args) => args[0] === 'config' && args[1] === 'G-TEST123456')).toBe(true);
  });

  it('turns GA event names into letters, digits and underscores', () => {
    environment.production = true;
    environment.googleAnalyticsId = 'G-TEST123456';
    create().trackEvent('project-visit', 'LotoKarma');
    const sent = (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));
    expect(sent.some((args) => args[0] === 'event' && args[1] === 'project_visit')).toBe(true);
  });
});
