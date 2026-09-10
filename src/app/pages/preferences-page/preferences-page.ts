import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { PreferencesService } from '../../core/preferences.service';
import { ThemeService, type Theme } from '../../core/theme.service';
import { SpotlightDirective } from '../../shared/spotlight.directive';

/**
 * Reading-comfort and motion settings, kept apart from the accessibility
 * *statement* page (a legal RGAA declaration) — this is a control panel a
 * visitor actually uses, so unlike that page it goes through i18n like the
 * rest of the app.
 */
@Component({
  selector: 'sn8w-preferences-page',
  imports: [RouterLink, DecimalPipe, SpotlightDirective],
  templateUrl: './preferences-page.html',
  styleUrl: './preferences-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesPage {
  protected readonly i18n = inject(I18nService);
  protected readonly prefs = inject(PreferencesService);
  protected readonly theme = inject(ThemeService);

  protected readonly themes: readonly Theme[] = ['frost', 'squirrel', 'contrast'];

  protected themeLabel(theme: Theme): string {
    const dict = this.i18n.dict().common;
    return theme === 'frost' ? dict.themeFrost : theme === 'squirrel' ? dict.themeSquirrel : dict.themeContrast;
  }
}
