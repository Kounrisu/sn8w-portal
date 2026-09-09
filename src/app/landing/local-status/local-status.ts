import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../core/i18n/i18n.service';
import { WeatherService } from '../../core/weather.service';

/**
 * A live Paris date/time + weather strip under the hero's location kicker.
 * Fixed to Paris rather than the visitor's own location — no browser
 * geolocation prompt, and it doubles as "where I am", not "where you are".
 */
@Component({
  selector: 'sn8w-local-status',
  imports: [MatIconModule],
  templateUrl: './local-status.html',
  styleUrl: './local-status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalStatus {
  protected readonly i18n = inject(I18nService);
  protected readonly weather = inject(WeatherService);

  private readonly now = signal(new Date());

  protected readonly dateTimeLabel = computed(() =>
    new Intl.DateTimeFormat(this.i18n.lang(), {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    }).format(this.now()),
  );

  constructor() {
    const timer = setInterval(() => this.now.set(new Date()), 30_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}
