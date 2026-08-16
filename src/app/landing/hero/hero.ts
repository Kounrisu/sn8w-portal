import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { ThemeService } from '../../core/theme.service';
import { SakuraScene } from '../sakura-scene/sakura-scene';

@Component({
  selector: 'sn8w-hero',
  imports: [RouterLink, SakuraScene],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  protected readonly i18n = inject(I18nService);
  protected readonly theme = inject(ThemeService);
}
