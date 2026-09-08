import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatTooltipModule } from '@angular/material/tooltip';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ThemeService, type Theme } from '../../core/theme.service';
import type { Lang } from '../../core/i18n/dictionary';

interface NavLink {
  readonly fragment: string;
  readonly label: string;
}

@Component({
  selector: 'sn8w-nav',
  imports: [RouterLink, FormsModule, MatTooltipModule],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nav {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly themeLabel = computed(() => {
    const dict = this.i18n.dict().common;
    return { frost: dict.themeFrost, squirrel: dict.themeSquirrel } as const;
  });

  protected readonly version = environment.version;
  protected readonly build = environment.build;
  protected readonly commit = environment.commit;
  protected readonly commitMessage = environment.commitMessage;
  protected readonly deployedAt = environment.deployedAt;

  protected readonly deployedAtLabel = computed(() => {
    const iso = this.deployedAt;
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return iso;
    return new Intl.DateTimeFormat(this.i18n.lang(), {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(parsed);
  });

  protected readonly links = computed<readonly NavLink[]>(() => {
    const dict = this.i18n.dict();
    return [
      { fragment: 'products', label: dict.nav.products },
      { fragment: 'developer-tools', label: dict.nav.developerTools },
      { fragment: 'studio', label: dict.nav.about },
      { fragment: 'contact', label: dict.nav.contact },
    ];
  });

  protected readonly isCompact = toSignal(
    this.breakpointObserver.observe('(max-width: 900px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  constructor() {
    void this.auth.ensureChecked();

    const onScroll = () => this.scrolled.set(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));

    this.publishNavHeight();
  }

  /**
   * Publishes the nav bar's measured height as `--nav-h` on <html>, so the
   * hero can pin *below* the nav (`top: var(--nav-h)`) and fill exactly the
   * space left under it, and so fragment links scroll their target clear of
   * it. Measured rather than hard-coded because the bar's height moves with
   * the fluid type scale, the compact breakpoint, and the translated label
   * lengths.
   *
   * Deliberately measures `.nav__inner` (the bar itself) and not the host:
   * on mobile the expanded menu is part of the host, and letting that count
   * would resize the hero every time the menu opens.
   */
  private publishNavHeight(): void {
    if (typeof ResizeObserver === 'undefined') return;

    // `afterNextRender`, not the constructor body: the template hasn't been
    // rendered yet at construction, so .nav__inner doesn't exist to measure.
    afterNextRender(
      () => {
        const bar = this.host.nativeElement.querySelector('.nav__inner');
        if (!bar) return;

        const observer = new ResizeObserver(([entry]) => {
          const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
          document.documentElement.style.setProperty('--nav-h', `${Math.round(height)}px`);
        });
        observer.observe(bar);
        this.destroyRef.onDestroy(() => observer.disconnect());
      },
      { injector: this.injector },
    );
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
    }
  }

  protected onEscape(): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      const toggle = this.host.nativeElement.querySelector('.menu-toggle');
      (toggle as HTMLButtonElement | null)?.focus();
    }
  }

  protected setLang(lang: Lang): void {
    this.i18n.setLang(lang);
  }

  protected setTheme(theme: Theme): void {
    this.theme.setTheme(theme);
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    this.closeMenu();
    await this.router.navigateByUrl('/');
  }
}
