import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'frost' | 'squirrel' | 'contrast';

const STORAGE_KEY = 'sn8w-theme';
const SUPPORTED: readonly Theme[] = ['frost', 'squirrel', 'contrast'];

function detectInitialTheme(): Theme {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored as Theme)) {
      return stored as Theme;
    }
  }
  // First-time visitors land on the light theme ("squirrel" in the code);
  // the dark one (frost) stays one click away in the nav toggle, and a
  // visitor's own choice, saved above, always wins.
  return 'squirrel';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly supportedThemes = SUPPORTED;
  readonly theme = signal<Theme>(detectInitialTheme());

  constructor() {
    effect(() => {
      const theme = this.theme();
      if (typeof document !== 'undefined') {
        document.documentElement.dataset['theme'] = theme;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, theme);
      }
    });
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }
}
