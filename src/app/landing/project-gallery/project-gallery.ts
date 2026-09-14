import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import type { Project } from '../../core/models';
import { I18nService } from '../../core/i18n/i18n.service';

export const GALLERY_COPY = {
  en: {
    open: 'View screenshot',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    images: 'Screenshots',
    hint: 'Additional image paths, one per line. The uploaded cover appears first. Use /images/projects/… or /api/uploads/screenshots/… (PNG, JPEG or WebP).',
  },
  fr: {
    open: 'Voir la capture',
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
      <div class="gallery" [attr.aria-label]="copy().images + ': ' + project().name">
        <button
          type="button"
          class="cover"
          (click)="open(viewer, 0)"
          [attr.aria-label]="copy().open + ': ' + project().name + ' (1 / ' + images().length + ')'"
        >
          <img
            [src]="variant(images()[0], 'preview')"
            (error)="useOriginal($event, images()[0])"
            [alt]="project().name + ' — ' + copy().images + ' 1'"
            width="1440"
            height="900"
            loading="lazy"
            decoding="async"
          />
          <span>{{ copy().images }} · {{ images().length }} ↗</span>
        </button>
        @if (images().length > 1) {
          <div class="thumbnails">
            @for (src of images(); track src; let i = $index) {
              <button
                type="button"
                (click)="open(viewer, i)"
                [attr.aria-label]="copy().open + ' ' + (i + 1) + ': ' + project().name"
              >
                <img
                  [src]="variant(src, 'thumb')"
                  (error)="useOriginal($event, src)"
                  alt=""
                  width="144"
                  height="90"
                  loading="lazy"
                  decoding="async"
                />
                <span>{{ i + 1 }}</span>
              </button>
            }
          </div>
        }
      </div>
      <dialog
        #viewer
        [attr.aria-label]="project().name + ' — ' + copy().images"
        (close)="opened.set(false)"
        (keydown.arrowLeft)="move(-1, $event)"
        (keydown.arrowRight)="move(1, $event)"
        (click)="backdrop($event, viewer)"
      >
        <div class="toolbar">
          <strong>{{ project().name }}</strong>
          <button type="button" autofocus (click)="viewer.close()">{{ copy().close }} ×</button>
        </div>
        @if (opened()) {
          <img
            class="expanded"
            [src]="images()[selected()]"
            [alt]="project().name + ' — ' + copy().images + ' ' + (selected() + 1)"
          />
        }
        <div class="controls">
          <button type="button" (click)="move(-1)" [disabled]="images().length < 2">
            ← {{ copy().previous }}
          </button>
          <span aria-live="polite">{{ selected() + 1 }} / {{ images().length }}</span>
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
    event?.preventDefault();
    this.selected.update((index) => (index + step + this.images().length) % this.images().length);
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
}
