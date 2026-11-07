import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should render the portfolio with one h1, an RGAA reference and direct contact', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    fixture.detectChanges();
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();

    httpMock.expectOne('/api/session.php').flush({ authenticated: false });
    // ProjectsService fires two requests on init: the English/base `all`
    // load, and the language-aware `localized` load — identical URL when
    // the detected UI language is English, so `match` (not `expectOne`).
    for (const req of httpMock.match('/api/projects.php')) {
      req.flush([]);
    }

    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const headings = compiled.querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].textContent).toContain('Philippe Parmentier');
    expect(compiled.querySelector('.nav__links a')?.getAttribute('href')).toBe('/#products');
    expect(compiled.querySelector('#products .flagship-toolbar a')?.getAttribute('href')).toBe('/projects');
    expect(compiled.querySelector('.hero__stats')?.textContent).toContain('JS → 22');
    expect(compiled.querySelector('.hero__score')?.parentElement?.tagName).toBe('DD');
    expect(compiled.querySelector('.side-toc')?.getAttribute('aria-label')).not.toBe(
      compiled.querySelector('.nav__links')?.getAttribute('aria-label'),
    );

    const expertise = compiled.querySelector('#expertise');
    expect(expertise?.getAttribute('aria-labelledby')).toBe('expertise-heading');
    expect(expertise?.querySelectorAll('details > summary').length).toBe(3);
    expect(expertise?.querySelectorAll('.reference__grid span').length).toBe(106);
    expect(expertise?.querySelector('.reference__grid')?.getAttribute('aria-hidden')).toBe('true');
    expect(expertise?.querySelector('.reference__source')?.getAttribute('href')).toBe(
      'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/',
    );

    expect(compiled.querySelectorAll('#contact').length).toBe(1);
    expect(compiled.querySelector('#contact form')?.getAttribute('aria-labelledby')).toBe('cf-title');
    expect(compiled.querySelector('#contact a[href="mailto:kounrisu@gmail.com"]')).not.toBeNull();

    await router.navigateByUrl('/plan-du-site');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(Array.from(compiled.querySelectorAll('.sitemap__home a'), link => link.getAttribute('href'))).toEqual([
      '/#products', '/#expertise', '/#studio', '/#contact',
    ]);
    expect(compiled.querySelectorAll('.sitemap a[href="/projects"]').length).toBe(1);
  });
});
