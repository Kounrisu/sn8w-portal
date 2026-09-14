import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import type { Project } from '../../core/models';
import { I18nService } from '../../core/i18n/i18n.service';
import { defaultCaption } from '../../core/project-captions';

export const GALLERY_COPY = {
  en: {
    open: 'See the bigger picture',
    opensDialog: 'opens the screenshot gallery dialog',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    images: 'Screenshots',
    image: 'Screenshot',
    captions: 'Screenshot captions',
    captionHint:
      'A short description of each screen, shown beneath the enlarged image. Up to 500 characters per language. Leave blank to omit a caption.',
    captionEnglish: 'Caption in English',
    captionFrench: 'Caption in French',
    hint: 'Additional image paths, one per line. The uploaded cover appears first. Use /images/projects/… or /api/uploads/screenshots/… (PNG, JPEG or WebP).',
  },
  fr: {
    open: 'Voyez le projet en grand',
    opensDialog: 'ouvre la galerie de captures dans une fenêtre de dialogue',
    close: 'Fermer',
    previous: 'Précédente',
    next: 'Suivante',
    images: 'Captures d’écran',
    image: 'Capture',
    captions: 'Légendes des captures',
    captionHint:
      'Une courte description de chaque écran, affichée sous l’image agrandie. Jusqu’à 500 caractères par langue. Laissez vide pour ne pas afficher de légende.',
    captionEnglish: 'Légende en anglais',
    captionFrench: 'Légende en français',
    hint: 'Chemins des images supplémentaires, un par ligne. La couverture téléversée apparaît en premier. Utilisez /images/projects/… ou /api/uploads/screenshots/… (PNG, JPEG ou WebP).',
  },
};

@Component({
  selector: 'sn8w-project-gallery',
  templateUrl: './project-gallery.html',
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
  readonly activeIndex = computed(() =>
    Math.min(this.selected(), Math.max(0, this.images().length - 1)),
  );
  readonly opened = signal(false);
  readonly currentImage = computed(() => this.images()[this.activeIndex()]);
  readonly activeSlides = computed(() => [{ src: this.currentImage() }]);
  readonly caption = computed(() => {
    const path = this.currentImage();
    const captions = this.project().screenshotCaptions?.[path] ?? defaultCaption(path ?? '');
    return captions[this.i18n.lang()] ?? captions.en ?? '';
  });
  readonly position = computed(
    () =>
      `${String(this.activeIndex() + 1).padStart(2, '0')} / ${String(this.images().length).padStart(2, '0')}`,
  );
  readonly imageLabel = computed(
    () => `${this.project().name} — ${this.copy().image} ${this.activeIndex() + 1}`,
  );
  readonly openLabel = computed(
    () => `${this.copy().open} — ${this.project().name} : ${this.copy().opensDialog}`,
  );
  imageLoaded(event: Event): void {
    (event.target as HTMLImageElement).classList.add('image-ready');
  }
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
