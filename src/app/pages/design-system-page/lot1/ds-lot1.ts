import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { DesignSystemCopy } from '../../../core/i18n/design-system-copy';

/**
 * "Essential components" of the SN8W design system — the twelve components
 * of the second batch (select, checkbox, radio, search bar, breadcrumb,
 * pagination, stepper, tooltip, modal, callout, card, table), mirrored from
 * the Figma file. A component of its own so the page keeps a small
 * stylesheet. Real, keyboard-operable controls: native <select>, <input>,
 * <dialog>; roving state only where the pattern needs it.
 */
@Component({
  selector: 'sn8w-ds-lot1',
  imports: [RouterLink],
  templateUrl: './ds-lot1.html',
  styleUrl: './ds-lot1.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsLot1 {
  readonly copy = input.required<DesignSystemCopy>();

  protected readonly pageNo = signal(6);
  protected readonly stepNo = signal(2);
  protected readonly tipOpen = signal(false);
  protected readonly totalPages = 12;

  /** Page numbers around the current one, with ellipses: 1 … 5 [6] 7 … 12. */
  protected readonly pageItems = computed<(number | '…')[]>(() => {
    const total = this.totalPages;
    const current = this.pageNo();
    const wanted = new Set<number>([1, total, current - 1, current, current + 1]);
    const sorted = [...wanted].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
    const items: (number | '…')[] = [];
    sorted.forEach((n, i) => {
      if (i > 0 && n - sorted[i - 1] > 1) items.push('…');
      items.push(n);
    });
    return items;
  });

  protected goToPage(n: number): void {
    this.pageNo.set(Math.min(this.totalPages, Math.max(1, n)));
  }

  protected goToStep(n: number): void {
    this.stepNo.set(Math.min(4, Math.max(1, n)));
  }

  /** A click on the dialog's own backdrop (not its content) closes it. */
  protected closeOnBackdrop(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target === dialog) dialog.close();
  }
}
