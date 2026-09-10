import { Injectable, computed, effect, signal } from '@angular/core';

export type MotionPreference = 'system' | 'reduced';
export type ReadingFontChoice = 'off' | 'lexend' | 'atkinson';

const STORAGE_KEY = 'sn8w-a11y-prefs';

/** Indexed, not a raw multiplier, so "increase/decrease" never has to
 * compare floats — the settings page's slider just moves the index. */
const TEXT_SCALE_STEPS: readonly number[] = [0.9, 1, 1.1, 1.25, 1.4];
const DEFAULT_TEXT_SCALE_INDEX = 1; // 1.0, i.e. no change

// Index 0 is "off" (component's own line-height stands) — every other step
// is a real WCAG 2.1 SC 1.4.12 (Text Spacing) value or looser.
const LINE_HEIGHT_STEPS: readonly number[] = [0, 1.5, 1.75, 2];

// Letter/word spacing travel together (both are "character spacing" in
// plain language) — index 0 is off, 1 is the SC 1.4.12 minimum, 2 is looser.
const CHAR_SPACING_STEPS: readonly { letter: number; word: number }[] = [
  { letter: 0, word: 0 },
  { letter: 0.12, word: 0.16 },
  { letter: 0.18, word: 0.24 },
];

interface StoredPrefs {
  readonly textScaleIndex: number;
  readonly boldText: boolean;
  readonly dyslexicFont: ReadingFontChoice;
  readonly lineHeightIndex: number;
  readonly charSpacingIndex: number;
  readonly motion: MotionPreference;
}

const DEFAULTS: StoredPrefs = {
  textScaleIndex: DEFAULT_TEXT_SCALE_INDEX,
  boldText: false,
  dyslexicFont: 'off',
  lineHeightIndex: 0,
  charSpacingIndex: 0,
  motion: 'system',
};

function inRange(value: unknown, length: number): value is number {
  return typeof value === 'number' && value >= 0 && value < length;
}

function loadStored(): StoredPrefs {
  if (typeof localStorage === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Omit<StoredPrefs, 'dyslexicFont'>> & {
      textSpacing?: boolean;
      dyslexicFont?: ReadingFontChoice | boolean;
    };
    return {
      textScaleIndex: inRange(parsed.textScaleIndex, TEXT_SCALE_STEPS.length)
        ? parsed.textScaleIndex
        : DEFAULTS.textScaleIndex,
      boldText: parsed.boldText === true,
      dyslexicFont:
        parsed.dyslexicFont === 'lexend' || parsed.dyslexicFont === 'atkinson'
          ? parsed.dyslexicFont
          // dyslexicFont used to be a boolean (true meant "Lexend", the only
          // option that existed) — carry that forward as an equivalent
          // choice instead of silently resetting it to off.
          : parsed.dyslexicFont === true
            ? 'lexend'
            : DEFAULTS.dyslexicFont,
      lineHeightIndex: inRange(parsed.lineHeightIndex, LINE_HEIGHT_STEPS.length)
        ? parsed.lineHeightIndex
        : DEFAULTS.lineHeightIndex,
      // parsed.textSpacing is the old (removed) boolean toggle — a visitor
      // who had it on keeps an equivalent spacing level after this upgrade
      // instead of silently reverting to off.
      charSpacingIndex: inRange(parsed.charSpacingIndex, CHAR_SPACING_STEPS.length)
        ? parsed.charSpacingIndex
        : parsed.textSpacing === true
          ? 1
          : DEFAULTS.charSpacingIndex,
      motion: parsed.motion === 'reduced' ? 'reduced' : 'system',
    };
  } catch {
    return DEFAULTS;
  }
}

/**
 * Reading-comfort settings — font size, weight, typeface, spacing and a
 * motion override — kept apart from ThemeService (which is about visual
 * identity, frost vs squirrel) since these are accessibility accommodations
 * a visitor sets once and expects to persist, not a matter of taste.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly textScaleSteps = TEXT_SCALE_STEPS;
  readonly lineHeightSteps = LINE_HEIGHT_STEPS;
  readonly charSpacingSteps = CHAR_SPACING_STEPS;

  private readonly initial = loadStored();

  readonly textScaleIndex = signal(this.initial.textScaleIndex);
  readonly boldText = signal(this.initial.boldText);
  readonly dyslexicFont = signal<ReadingFontChoice>(this.initial.dyslexicFont);
  readonly lineHeightIndex = signal(this.initial.lineHeightIndex);
  readonly charSpacingIndex = signal(this.initial.charSpacingIndex);
  readonly motion = signal<MotionPreference>(this.initial.motion);

  readonly textScale = computed(() => TEXT_SCALE_STEPS[this.textScaleIndex()]);

  readonly hasCustomizations = computed(
    () =>
      this.textScaleIndex() !== DEFAULTS.textScaleIndex ||
      this.boldText() !== DEFAULTS.boldText ||
      this.dyslexicFont() !== DEFAULTS.dyslexicFont ||
      this.lineHeightIndex() !== DEFAULTS.lineHeightIndex ||
      this.charSpacingIndex() !== DEFAULTS.charSpacingIndex ||
      this.motion() !== DEFAULTS.motion,
  );

  private motionStyleEl: HTMLStyleElement | null = null;

  constructor() {
    effect(() => {
      const prefs: StoredPrefs = {
        textScaleIndex: this.textScaleIndex(),
        boldText: this.boldText(),
        dyslexicFont: this.dyslexicFont(),
        lineHeightIndex: this.lineHeightIndex(),
        charSpacingIndex: this.charSpacingIndex(),
        motion: this.motion(),
      };
      this.applyToDocument(prefs);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      }
    });
  }

  setTextScaleIndex(index: number): void {
    this.textScaleIndex.set(Math.max(0, Math.min(index, TEXT_SCALE_STEPS.length - 1)));
  }

  setBoldText(value: boolean): void {
    this.boldText.set(value);
  }

  setDyslexicFont(value: ReadingFontChoice): void {
    this.dyslexicFont.set(value);
  }

  setLineHeightIndex(index: number): void {
    this.lineHeightIndex.set(Math.max(0, Math.min(index, LINE_HEIGHT_STEPS.length - 1)));
  }

  setCharSpacingIndex(index: number): void {
    this.charSpacingIndex.set(Math.max(0, Math.min(index, CHAR_SPACING_STEPS.length - 1)));
  }

  setMotion(value: MotionPreference): void {
    this.motion.set(value);
  }

  resetAll(): void {
    this.textScaleIndex.set(DEFAULTS.textScaleIndex);
    this.boldText.set(DEFAULTS.boldText);
    this.dyslexicFont.set(DEFAULTS.dyslexicFont);
    this.lineHeightIndex.set(DEFAULTS.lineHeightIndex);
    this.charSpacingIndex.set(DEFAULTS.charSpacingIndex);
    this.motion.set(DEFAULTS.motion);
  }

  private applyToDocument(prefs: StoredPrefs): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--text-scale', String(TEXT_SCALE_STEPS[prefs.textScaleIndex]));
    root.classList.toggle('a11y-bold-text', prefs.boldText);
    root.classList.toggle('a11y-dyslexic-font', prefs.dyslexicFont === 'lexend');
    root.classList.toggle('a11y-atkinson-font', prefs.dyslexicFont === 'atkinson');

    const lineHeight = LINE_HEIGHT_STEPS[prefs.lineHeightIndex];
    root.style.setProperty('--a11y-line-height', String(lineHeight || 1.5));
    root.classList.toggle('a11y-line-height', prefs.lineHeightIndex > 0);

    const charSpacing = CHAR_SPACING_STEPS[prefs.charSpacingIndex];
    root.style.setProperty('--a11y-letter-spacing', `${charSpacing.letter}em`);
    root.style.setProperty('--a11y-word-spacing', `${charSpacing.word}em`);
    root.classList.toggle('a11y-char-spacing', prefs.charSpacingIndex > 0);

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
