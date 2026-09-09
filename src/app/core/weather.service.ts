import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/** Fixed to Paris on purpose — no browser geolocation prompt for this. */
const PARIS_LAT = 48.8566;
const PARIS_LON = 2.3522;

interface OpenMeteoResponse {
  readonly current: {
    readonly temperature_2m: number;
    readonly weather_code: number;
  };
}

export interface WeatherReading {
  readonly temperatureC: number;
  /** Classic Material Icons ligature name — see WMO code mapping below. */
  readonly icon: string;
}

/**
 * WMO weather codes (used by Open-Meteo, no API key required) collapsed to
 * the handful of icons this UI actually distinguishes.
 */
function iconForCode(code: number): string {
  if (code === 0) return 'wb_sunny';
  if (code === 1 || code === 2) return 'wb_cloudy';
  if (code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'blur_on';
  if (code >= 71 && code <= 77) return 'ac_unit';
  if (code >= 95) return 'flash_on';
  // Drizzle, rain, rain showers.
  return 'opacity';
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);

  private readonly reading = signal<WeatherReading | null>(null);
  readonly loaded = signal(false);

  readonly temperatureC = computed(() => this.reading()?.temperatureC ?? null);
  readonly icon = computed(() => this.reading()?.icon ?? null);

  constructor() {
    void this.load();
    // Weather doesn't change fast enough to justify polling more often, and
    // most visits are short — this just keeps a long-open tab from going stale.
    setInterval(() => void this.load(), 30 * 60 * 1000);
  }

  private async load(): Promise<void> {
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${PARIS_LAT}&longitude=${PARIS_LON}` +
        `&current=temperature_2m,weather_code&timezone=Europe%2FParis`;
      const response = await firstValueFrom(this.http.get<OpenMeteoResponse>(url));
      this.reading.set({
        temperatureC: Math.round(response.current.temperature_2m),
        icon: iconForCode(response.current.weather_code),
      });
    } catch {
      // Leave the previous reading (if any) in place rather than clearing
      // it on a transient network failure.
    } finally {
      this.loaded.set(true);
    }
  }
}
