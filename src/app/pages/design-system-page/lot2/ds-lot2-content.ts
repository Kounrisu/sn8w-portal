import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { DesignSystemCopy } from '../../../core/i18n/design-system-copy';

/** Lot 2 — content and feedback: notice, highlight, quote, tile. */
@Component({
  selector: 'sn8w-ds-lot2-content',
  imports: [RouterLink],
  templateUrl: './ds-lot2-content.html',
  styleUrl: './ds-lot2-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsLot2Content {
  readonly copy = input.required<DesignSystemCopy>();

  protected readonly dismissed = signal<readonly number[]>([]);
  protected readonly tones = ['info', 'warning', 'alert'] as const;
  protected readonly tileRoutes = [
    ['/design-system', 'accessibility'],
    ['/design-system', 'governance'],
    ['/design-system', 'foundations'],
  ] as const;

  protected dismiss(index: number): void {
    this.dismissed.update((list) => [...list, index]);
    // Keep keyboard users in place: move focus to the section heading, not to <body>.
    queueMicrotask(() => document.getElementById('ds-lot2-content-title')?.focus());
  }

  protected restore(): void {
    this.dismissed.set([]);
  }
}
