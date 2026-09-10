import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { PreferencesService, type ReadingFontChoice } from '../../core/preferences.service';
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
  imports: [RouterLink, DecimalPipe, FormsModule, SpotlightDirective],
  templateUrl: './preferences-page.html',
  styleUrl: './preferences-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesPage {
  protected readonly i18n = inject(I18nService);
  protected readonly prefs = inject(PreferencesService);
  protected readonly theme = inject(ThemeService);

  protected readonly themes: readonly Theme[] = ['frost', 'squirrel', 'contrast'];
  protected readonly fontChoices: readonly ReadingFontChoice[] = ['off', 'lexend', 'atkinson'];

  protected themeLabel(theme: Theme): string {
    const dict = this.i18n.dict().common;
    return theme === 'frost' ? dict.themeFrost : theme === 'squirrel' ? dict.themeSquirrel : dict.themeContrast;
  }

  protected fontChoiceLabel(choice: ReadingFontChoice): string {
    const dict = this.i18n.dict().preferences;
    if (choice === 'lexend') return dict.dyslexicFontLexend;
    if (choice === 'atkinson') return dict.dyslexicFontAtkinson;
    return this.i18n.dict().common.off;
  }

  protected lineHeightStepLabel(index: number): string {
    const value = this.prefs.lineHeightSteps[index];
    return value === 0 ? this.i18n.dict().common.off : `${value}×`;
  }

  protected charSpacingStepLabel(index: number): string {
    if (index === 0) return this.i18n.dict().common.off;
    return `+${index}`;
  }

  protected onTextScaleInput(value: string): void {
    this.prefs.setTextScaleIndex(Number(value));
  }

  protected onLineHeightInput(value: string): void {
    this.prefs.setLineHeightIndex(Number(value));
  }

  protected onCharSpacingInput(value: string): void {
    this.prefs.setCharSpacingIndex(Number(value));
  }
}
