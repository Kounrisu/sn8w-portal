import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
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

  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly themeLabel = computed(() => {
    const dict = this.i18n.dict().common;
    return { frost: dict.themeFrost, squirrel: dict.themeSquirrel } as const;
  });

  protected readonly version = environment.version;
  protected readonly commit = environment.commit;
  protected readonly deployedAt = environment.deployedAt;

  protected readonly links = computed<readonly NavLink[]>(() => {
    const dict = this.i18n.dict();
    return [
      { fragment: 'products', label: dict.nav.products },
      { fragment: 'developer-tools', label: dict.nav.developerTools },
      { fragment: 'studio', label: dict.nav.about },
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
