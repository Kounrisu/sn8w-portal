import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { I18nService } from '../../core/i18n/i18n.service';
import { SpotlightDirective } from '../../shared/spotlight.directive';

interface AnalyticsSummary {
  readonly totalViews: number;
  readonly totalVisitors: number;
  readonly avgDurationMs: number | null;
  readonly byPath: readonly { path: string; views: number }[];
  readonly byReferrer: readonly { referrer: string | null; views: number }[];
  readonly byDay: readonly { day: string; views: number }[];
  readonly clicks: readonly { kind: string; label: string | null; clicks: number }[];
}

@Component({
  selector: 'sn8w-analytics-page',
  imports: [RouterLink, SpotlightDirective],
  templateUrl: './analytics-page.html',
  styleUrl: './analytics-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPage {
  protected readonly i18n = inject(I18nService);
  private readonly http = inject(HttpClient);

  protected readonly loaded = signal(false);
  protected readonly summary = signal<AnalyticsSummary | null>(null);

  protected readonly avgDurationLabel = computed(() => {
    const ms = this.summary()?.avgDurationMs;
    if (ms === null || ms === undefined) return '—';
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  protected readonly maxDayViews = computed(() =>
    Math.max(1, ...(this.summary()?.byDay.map((d) => d.views) ?? [1])),
  );
  protected readonly maxPathViews = computed(() =>
    Math.max(1, ...(this.summary()?.byPath.map((p) => p.views) ?? [1])),
  );
  protected readonly maxReferrerViews = computed(() =>
    Math.max(1, ...(this.summary()?.byReferrer.map((r) => r.views) ?? [1])),
  );
  protected readonly maxClicks = computed(() =>
    Math.max(1, ...(this.summary()?.clicks.map((c) => c.clicks) ?? [1])),
  );

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      this.summary.set(await firstValueFrom(this.http.get<AnalyticsSummary>('/api/analytics.php')));
    } catch {
      this.summary.set(null);
    } finally {
      this.loaded.set(true);
    }
  }

  protected referrerLabel(referrer: string | null): string {
    return referrer ?? this.i18n.dict().analytics.directReferrer;
  }

  protected dayLabel(day: string): string {
    return new Intl.DateTimeFormat(this.i18n.lang(), { month: 'short', day: 'numeric' }).format(new Date(day));
  }
}
