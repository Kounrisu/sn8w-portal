import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type { Lang } from './dictionary';
import { I18nService } from './i18n.service';
import { TRANSLATIONS } from './translations';

describe('I18nService', () => {
  beforeEach(() => {
    localStorage.removeItem('sn8w-lang');
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR');
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    localStorage.removeItem('sn8w-lang');
    document.documentElement.lang = '';
  });

  it('offers and loads only French and English', () => {
    const service = TestBed.inject(I18nService);
    expect(service.supportedLangs).toEqual(['fr', 'en']);
    expect(Object.keys(TRANSLATIONS).sort()).toEqual(['en', 'fr']);
  });

  it.each(['de', 'es', 'ja', 'ko'])('replaces a saved %s preference with French', (lang) => {
    localStorage.setItem('sn8w-lang', lang);
    const service = TestBed.inject(I18nService);
    TestBed.tick();
    expect(service.lang()).toBe('fr');
    expect(service.dict()).toBe(TRANSLATIONS.fr);
    expect(localStorage.getItem('sn8w-lang')).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
  });

  it('uses English browser preferences when a saved language is unavailable', () => {
    localStorage.setItem('sn8w-lang', 'de');
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB');
    expect(TestBed.inject(I18nService).lang()).toBe('en');
  });

  it('defaults to French for an unsupported browser language', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE');
    expect(TestBed.inject(I18nService).lang()).toBe('fr');
  });

  it('keeps a supported saved language ahead of the browser preference', () => {
    localStorage.setItem('sn8w-lang', 'en');
    expect(TestBed.inject(I18nService).lang()).toBe('en');
  });

  it('switches the dictionary, document language and saved preference together', () => {
    const service = TestBed.inject(I18nService);
    service.setLang('en');
    TestBed.tick();
    expect(service.dict()).toBe(TRANSLATIONS.en);
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('sn8w-lang')).toBe('en');
    service.setLang('fr');
    TestBed.tick();
    expect(service.dict()).toBe(TRANSLATIONS.fr);
    expect(document.documentElement.lang).toBe('fr');
    expect(localStorage.getItem('sn8w-lang')).toBe('fr');
  });

  it('ignores an unsupported language passed at runtime', () => {
    const service = TestBed.inject(I18nService);
    service.setLang('de' as Lang);
    expect(service.lang()).toBe('fr');
    expect(service.dict()).toBe(TRANSLATIONS.fr);
  });
});
