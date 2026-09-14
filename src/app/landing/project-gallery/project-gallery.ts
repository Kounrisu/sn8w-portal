import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import type { Project } from '../../core/models';
import { I18nService } from '../../core/i18n/i18n.service';

export const GALLERY_COPY = {
  en: {
    open: 'Enlarge',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    images: 'Screenshots',
    hint: 'Additional image paths, one per line. The uploaded cover appears first. Use /images/projects/… or /api/uploads/screenshots/… (PNG, JPEG or WebP).',
  },
  fr: {
    open: 'Agrandir',
    close: 'Fermer',
    previous: 'Précédente',
    next: 'Suivante',
    images: 'Captures d’écran',
    hint: 'Chemins des images supplémentaires, un par ligne. La couverture téléversée apparaît en premier. Utilisez /images/projects/… ou /api/uploads/screenshots/… (PNG, JPEG ou WebP).',
  },
};

@Component({
  selector: 'sn8w-project-gallery',
  template: `
    @if (images().length) {
      <div class="gallery" role="group" [attr.aria-label]="copy().images + ': ' + project().name"
        (keydown.arrowLeft)="move(-1, $event)" (keydown.arrowRight)="move(1, $event)">
        <button
          type="button"
          class="cover"
          (click)="open(viewer, activeIndex())"
          aria-haspopup="dialog"
          [attr.aria-label]="copy().open + ': ' + project().name + ' (' + (activeIndex() + 1) + ' / ' + images().length + ')'"
        >
          <img
            [src]="variant(images()[activeIndex()], 'preview')"
            (error)="useOriginal($event, images()[activeIndex()])"
            [alt]="project().name + ' — ' + copy().images + ' ' + (activeIndex() + 1)"
            width="1440"
            height="900"
            loading="lazy"
            decoding="async"
          />
          <span>{{ copy().open }} ↗</span>
        </button>
        @if (images().length > 1) {
          <div class="controls inline-controls">
            <button type="button" (click)="move(-1)" [attr.aria-label]="copy().previous + ': ' + project().name">← {{ copy().previous }}</button>
            <span role="status" [attr.aria-live]="opened() ? 'off' : 'polite'" aria-atomic="true"><span class="sr-only">{{ copy().images }} </span>{{ activeIndex() + 1 }} / {{ images().length }}</span>
            <button type="button" (click)="move(1)" [attr.aria-label]="copy().next + ': ' + project().name">{{ copy().next }} →</button>
          </div>
        }
      </div>
      <dialog
        #viewer
        [attr.aria-label]="project().name + ' — ' + copy().images"
        (close)="opened.set(false)"
        (keydown.arrowLeft)="move(-1, $event)"
        (keydown.arrowRight)="move(1, $event)"
        (keydown.tab)="keepFocus($event, viewer)"
        (keydown.shift.tab)="keepFocus($event, viewer)"
        (click)="backdrop($event, viewer)"
      >
        <div class="toolbar">
          <strong>{{ project().name }}</strong>
          <button type="button" autofocus (click)="viewer.close()">{{ copy().close }} ×</button>
        </div>
        @if (opened()) {
          <img
            class="expanded"
            [src]="images()[activeIndex()]"
            [alt]="project().name + ' — ' + copy().images + ' ' + (activeIndex() + 1)"
          />
        }
        <div class="controls">
          <button type="button" (click)="move(-1)" [disabled]="images().length < 2">
            ← {{ copy().previous }}
          </button>
          <span aria-live="polite" aria-atomic="true"><span class="sr-only">{{ copy().images }} </span>{{ activeIndex() + 1 }} / {{ images().length }}</span>
          <button type="button" (click)="move(1)" [disabled]="images().length < 2">
            {{ copy().next }} →
          </button>
        </div>
      </dialog>
    }
  `,
  styleUrl: './project-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectGallery {
  readonly project = input.required<Project>();
  private readonly i18n = inject(I18nService);
  readonly copy = computed(() => GALLERY_COPY[this.i18n.lang()]);
  readonly images = computed(() => [
    ...new Set(
      [this.project().screenshot, ...(this.project().screenshots ?? [])].filter(
        (src): src is string => !!src,
      ),
    ),
  ]);
  readonly selected = signal(0);
  readonly activeIndex = computed(() => Math.min(this.selected(), Math.max(0, this.images().length - 1)));
  readonly opened = signal(false);
  useOriginal(event: Event, src: string): void {
    const image = event.target as HTMLImageElement;
    if (image.getAttribute('src') !== src) image.src = src;
  }
  variant(src: string, size: 'thumb' | 'preview'): string {
    return src.startsWith('/images/projects/') && src.endsWith('.webp')
      ? src.replace(/\.webp$/, `.${size}.webp`)
      : src;
  }
  open(dialog: HTMLDialogElement, index: number): void {
    this.selected.set(index);
    this.opened.set(true);
    dialog.showModal();
  }
  move(step: number, event?: Event): void {
    if (this.images().length < 2) return;
    event?.preventDefault();
    this.selected.set((this.activeIndex() + step + this.images().length) % this.images().length);
  }
  backdrop(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  }
  keepFocus(event: Event, dialog: HTMLDialogElement): void {
    const key = event as KeyboardEvent;
    const buttons = dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (key.shiftKey && document.activeElement === first) {
      key.preventDefault();
      last?.focus();
    } else if (!key.shiftKey && document.activeElement === last) {
      key.preventDefault();
      first?.focus();
    }
  }
}
