import { Injectable, computed, effect, signal } from '@angular/core';

export type MotionPreference = 'system' | 'reduced';

const STORAGE_KEY = 'sn8w-a11y-prefs';

/** Indexed, not a raw multiplier, so "increase/decrease" never has to
 * compare floats — the settings page's +/- buttons just move the index. */
const TEXT_SCALE_STEPS: readonly number[] = [0.9, 1, 1.1, 1.25, 1.4];
const DEFAULT_TEXT_SCALE_INDEX = 1; // 1.0, i.e. no change

interface StoredPrefs {
  readonly textScaleIndex: number;
  readonly boldText: boolean;
  readonly dyslexicFont: boolean;
  readonly textSpacing: boolean;
  readonly motion: MotionPreference;
}

const DEFAULTS: StoredPrefs = {
  textScaleIndex: DEFAULT_TEXT_SCALE_INDEX,
  boldText: false,
  dyslexicFont: false,
  textSpacing: false,
  motion: 'system',
};

function loadStored(): StoredPrefs {
  if (typeof localStorage === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<StoredPrefs>;
    return {
      textScaleIndex:
        typeof parsed.textScaleIndex === 'number' &&
        parsed.textScaleIndex >= 0 &&
        parsed.textScaleIndex < TEXT_SCALE_STEPS.length
          ? parsed.textScaleIndex
          : DEFAULTS.textScaleIndex,
      boldText: parsed.boldText === true,
      dyslexicFont: parsed.dyslexicFont === true,
      textSpacing: parsed.textSpacing === true,
      motion: parsed.motion === 'reduced' ? 'reduced' : 'system',
    };
  } catch {
    return DEFAULTS;
  }
}

/**
 * Reading-comfort settings — font size, weight, typeface, and a motion
 * override — kept apart from ThemeService (which is about visual identity,
 * frost vs squirrel) since these are accessibility accommodations a
 * visitor sets once and expects to persist, not a matter of taste.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly textScaleSteps = TEXT_SCALE_STEPS;

  private readonly initial = loadStored();

  readonly textScaleIndex = signal(this.initial.textScaleIndex);
  readonly boldText = signal(this.initial.boldText);
  readonly dyslexicFont = signal(this.initial.dyslexicFont);
  readonly textSpacing = signal(this.initial.textSpacing);
  readonly motion = signal<MotionPreference>(this.initial.motion);

  readonly textScale = computed(() => TEXT_SCALE_STEPS[this.textScaleIndex()]);
  readonly canDecreaseTextScale = computed(() => this.textScaleIndex() > 0);
  readonly canIncreaseTextScale = computed(() => this.textScaleIndex() < TEXT_SCALE_STEPS.length - 1);

  private motionStyleEl: HTMLStyleElement | null = null;

  constructor() {
    effect(() => {
      const prefs: StoredPrefs = {
        textScaleIndex: this.textScaleIndex(),
        boldText: this.boldText(),
        dyslexicFont: this.dyslexicFont(),
        textSpacing: this.textSpacing(),
        motion: this.motion(),
      };
      this.applyToDocument(prefs);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      }
    });
  }

  increaseTextScale(): void {
    this.textScaleIndex.update((i) => Math.min(i + 1, TEXT_SCALE_STEPS.length - 1));
  }

  decreaseTextScale(): void {
    this.textScaleIndex.update((i) => Math.max(i - 1, 0));
  }

  setBoldText(value: boolean): void {
    this.boldText.set(value);
  }

  setDyslexicFont(value: boolean): void {
    this.dyslexicFont.set(value);
  }

  setTextSpacing(value: boolean): void {
    this.textSpacing.set(value);
  }

  setMotion(value: MotionPreference): void {
    this.motion.set(value);
  }

  resetAll(): void {
    this.textScaleIndex.set(DEFAULTS.textScaleIndex);
    this.boldText.set(DEFAULTS.boldText);
    this.dyslexicFont.set(DEFAULTS.dyslexicFont);
    this.textSpacing.set(DEFAULTS.textSpacing);
    this.motion.set(DEFAULTS.motion);
  }

  private applyToDocument(prefs: StoredPrefs): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--text-scale', String(TEXT_SCALE_STEPS[prefs.textScaleIndex]));
    root.classList.toggle('a11y-bold-text', prefs.boldText);
    root.classList.toggle('a11y-dyslexic-font', prefs.dyslexicFont);
    root.classList.toggle('a11y-text-spacing', prefs.textSpacing);
    this.applyMotion(prefs.motion);
  }

  /**
   * `prefers-reduced-motion: reduce` already covers the OS-level
   * preference throughout the app's own stylesheets. This is the explicit
   * opt-in for a visitor whose OS says "no preference" but who wants
   * animation off anyway — a blunt global override rather than hunting
   * down every transition/animation rule individually, injected only
   * while active and removed the moment the preference reverts to
   * 'system'.
   */
  private applyMotion(motion: MotionPreference): void {
    if (typeof document === 'undefined') return;
    if (motion === 'reduced') {
      if (!this.motionStyleEl) {
        const style = document.createElement('style');
        style.textContent = `
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        `;
        document.head.appendChild(style);
        this.motionStyleEl = style;
      }
    } else {
      this.motionStyleEl?.remove();
      this.motionStyleEl = null;
    }
  }
}
