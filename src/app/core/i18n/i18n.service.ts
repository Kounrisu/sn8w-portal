import { Injectable, computed, effect, signal } from '@angular/core';
import type { Lang } from './dictionary';
import { LANG_LABELS } from './dictionary';
import type { ProductStatus } from '../models';
import { TRANSLATIONS } from './translations';

const STORAGE_KEY = 'sn8w-lang';
const SUPPORTED: readonly Lang[] = ['en', 'fr', 'de', 'ko', 'ja', 'es'];

function detectInitialLang(): Lang {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored as Lang)) {
      return stored as Lang;
    }
  }

  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(browserLang as Lang)) {
      return browserLang as Lang;
    }
  }

  return 'en';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly supportedLangs = SUPPORTED;
  readonly langLabels = LANG_LABELS;

  readonly lang = signal<Lang>(detectInitialLang());
  readonly dict = computed(() => TRANSLATIONS[this.lang()]);

  constructor() {
    effect(() => {
      const lang = this.lang();
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, lang);
      }
    });
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  /** Translates a known ecosystem group title (stored in English in the DB). */
  groupLabel(title: string): string {
    const groups = this.dict().ecosystemSection.groups;
    const key = title.trim().toLowerCase();
    if (key === 'developer tools') return groups.developerTools;
    if (key === 'finance') return groups.finance;
    if (key === 'consumer') return groups.consumer;
    return title || groups.other;
  }

  statusLabel(status: ProductStatus): string {
    const s = this.dict().status;
    switch (status) {
      case 'live':
        return s.live;
      case 'in-development':
        return s.inDevelopment;
      case 'concept':
        return s.concept;
      case 'prototype':
        return s.prototype;
    }
  }
}
