import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PreferencesPage } from './preferences-page';
import { PreferencesService } from '../../core/preferences.service';
import { ThemeService } from '../../core/theme.service';

describe('Accessibility settings', () => {
  beforeEach(() => {
    localStorage.removeItem('sn8w-a11y-prefs');
    localStorage.removeItem('sn8w-theme');
    TestBed.configureTestingModule({imports:[PreferencesPage],providers:[provideRouter([])]});
  });

  afterEach(() => {
    TestBed.inject(PreferencesService).resetAll();
    TestBed.tick();
    TestBed.resetTestingModule();
    localStorage.removeItem('sn8w-a11y-prefs');
    localStorage.removeItem('sn8w-theme');
  });

  it('places motion first and uses labelled native radio groups', () => {
    const fixture = TestBed.createComponent(PreferencesPage);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.prefs__group input')?.getAttribute('name')).toBe('motion');
    expect(host.querySelectorAll('button[role="radio"]').length).toBe(0);
    for (const name of ['motion','reading-font','color-theme']) {
      expect(host.querySelectorAll(`input[name="${name}"]:checked`).length).toBe(1);
      for (const input of host.querySelectorAll(`input[name="${name}"]`)) {
        expect(input.closest('label')?.textContent?.trim()).toBeTruthy();
      }
    }
  });

  it('gives the bold toggle an accessible name and exposes its state', async () => {
    const fixture = TestBed.createComponent(PreferencesPage);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.prefs__switch');
    expect(button.getAttribute('aria-label')).toBeTruthy();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(TestBed.inject(PreferencesService).boldText()).toBe(true);
  });

  it('applies native radio changes to motion, font and colour settings', async () => {
    const fixture = TestBed.createComponent(PreferencesPage);
    fixture.detectChanges();
    for (const [name,value] of [['motion','reduced'],['reading-font','atkinson'],['color-theme','contrast']]) {
      const input: HTMLInputElement = fixture.nativeElement.querySelector(`input[name="${name}"][value="${value}"]`);
      input.click();
      await fixture.whenStable();
      expect(input.checked).toBe(true);
    }
    expect(TestBed.inject(PreferencesService).motion()).toBe('reduced');
    expect(TestBed.inject(PreferencesService).dyslexicFont()).toBe('atkinson');
    expect(TestBed.inject(ThemeService).theme()).toBe('contrast');
  });
});
