import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { dayIdOf, formatLongDate } from './day.model';

@Injectable({ providedIn: 'root' })
export class ClockService {
  private destroyRef = inject(DestroyRef);
  private _now = signal(new Date());

  readonly now = this._now.asReadonly();
  readonly todayId = computed(() => dayIdOf(this._now()));
  readonly todayLabel = computed(() => formatLongDate(this._now()));

  constructor() {
    // First tick lined up with the next minute change, then every 30 s
    const msToNextMinute = 60_000 - (Date.now() % 60_000);
    let interval: ReturnType<typeof setInterval>;

    const firstTick = setTimeout(() => {
      this._now.set(new Date());
      interval = setInterval(() => this._now.set(new Date()), 30_000);
    }, msToNextMinute);

    this.destroyRef.onDestroy(() => {
      clearTimeout(firstTick);
      clearInterval(interval);
    });
  }
}
