import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import type { DesignSystemCopy } from '../../../core/i18n/design-system-copy';

const MAX_UPLOAD = 5 * 1024 * 1024;

/** Lot 2 — forms: password, range, upload, segmented control (see the Figma file). */
@Component({
  selector: 'sn8w-ds-lot2-forms',
  templateUrl: './ds-lot2-forms.html',
  styleUrl: './ds-lot2-forms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsLot2Forms {
  readonly copy = input.required<DesignSystemCopy>();

  protected readonly showPassword = signal(false);
  protected readonly rangeValue = signal(110);
  protected readonly fileStatus = signal('');
  protected readonly fileError = signal(false);

  protected onRange(event: Event): void {
    this.rangeValue.set(Number((event.target as HTMLInputElement).value));
  }

  protected onFile(event: Event, none: string, tooLarge: string, selected: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      this.fileError.set(false);
      this.fileStatus.set(none);
    } else if (file.size > MAX_UPLOAD) {
      this.fileError.set(true);
      this.fileStatus.set(tooLarge);
      input.value = '';
    } else {
      this.fileError.set(false);
      this.fileStatus.set(selected + file.name);
    }
  }
}
