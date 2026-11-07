import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { I18nService } from '../../core/i18n/i18n.service';
import { DESIGN_SYSTEM_COPY } from '../../core/i18n/design-system-copy';
import { SpotlightDirective } from '../../shared/spotlight.directive';
import { DsLot1 } from './lot1/ds-lot1';
import { DsLot2Forms } from './lot2/ds-lot2-forms';
import { DsLot2Nav } from './lot2/ds-lot2-nav';
import { DsLot2Content } from './lot2/ds-lot2-content';

export const DS_SECTIONS = [
  'intro',
  'foundations',
  'components',
  'patterns',
  'accessibility',
  'governance',
] as const;
export type DesignSystemSection = (typeof DS_SECTIONS)[number];

/** Documentation specimens: the exact Figma values, shown whatever theme is active. */
const SWATCHES = {
  dark: ['#181A1B', '#202325', '#EEF0F3', '#328BFF', '#B4AFE2', '#A0A6AC'],
  light: ['#F7F9FC', '#FFFFFF', '#0F172A', '#1D4ED8', '#514B8F', '#55627A'],
} as const;

/**
 * The SN8W design system, linked from the Workshop: `/design-system` is the
 * introduction, `/design-system/:section` one of its five other pages. Content is
 * mirrored from the Figma file "SN8W — Design System"; the live demos below
 * (tabs, switch, accordion, tag) are real, keyboard-operable components, not
 * pictures of them.
 */
@Component({
  selector: 'sn8w-design-system-page',
  imports: [RouterLink, SpotlightDirective, DsLot1, DsLot2Forms, DsLot2Nav, DsLot2Content],
  templateUrl: './design-system-page.html',
  styleUrl: './design-system-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignSystemPage {
  protected readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly sections = DS_SECTIONS;
  protected readonly swatches = SWATCHES;
  protected readonly copy = computed(() => DESIGN_SYSTEM_COPY[this.i18n.lang()]);

  private readonly param = toSignal(this.route.paramMap.pipe(map((p) => p.get('section'))), {
    initialValue: this.route.snapshot.paramMap.get('section'),
  });

  protected readonly current = computed<DesignSystemSection>(() => {
    const value = this.param();
    return value === null ? 'intro' : this.isSection(value) ? value : 'intro';
  });

  // Demo state
  protected readonly activeTab = signal(0);
  protected readonly switchOn = signal(false);
  protected readonly tagVisible = signal(true);

  constructor() {
    // An unknown /workshop/xyz goes back to the introduction.
    effect(() => {
      const value = this.param();
      if (value !== null && !this.isSection(value)) {
        void this.router.navigateByUrl('/design-system', { replaceUrl: true });
      }
    });
  }

  private isSection(value: string): value is DesignSystemSection {
    return (DS_SECTIONS as readonly string[]).includes(value);
  }

  protected link(section: DesignSystemSection): string[] {
    return section === 'intro' ? ['/design-system'] : ['/design-system', section];
  }

  protected sectionLabel(section: DesignSystemSection): string {
    return this.copy().nav[section];
  }

  /** Tabs keyboard model (WAI-ARIA): arrows, Home, End; focus follows selection. */
  protected onTabKey(event: KeyboardEvent, count: number): void {
    const keys: Record<string, (i: number) => number> = {
      ArrowRight: (i) => (i + 1) % count,
      ArrowLeft: (i) => (i - 1 + count) % count,
      Home: () => 0,
      End: () => count - 1,
    };
    const move = keys[event.key];
    if (!move) return;
    event.preventDefault();
    const next = move(this.activeTab());
    this.activeTab.set(next);
    queueMicrotask(() => document.getElementById(`ds-tab-${next}`)?.focus());
  }
}
