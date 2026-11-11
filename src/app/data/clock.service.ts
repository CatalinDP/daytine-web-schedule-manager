import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { dayIdOf, formatLongDate } from './day.model';

@Injectable({ providedIn: 'root' })
export class ClockService {
  private destroyRef = inject(DestroyRef);
  private _now = signal(new Date());

  readonly now = this._now.asReadonly();
  readonly todayId = computed(() => dayIdOf(this._now()));
  readonly todayLabel = computed(() => formatLongDate(this._now()));
  readonly nowMinutes = computed(() => {
    const d = this._now();
    return d.getHours() * 60 + d.getMinutes();
  });

  constructor() {
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
