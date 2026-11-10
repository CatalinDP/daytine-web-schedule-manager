import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface WeeklyStatDay {
  readonly key: string;
  /** Narrow label shown under the bar, e.g. "M". */
  readonly label: string;
  /** Full description for assistive tech, e.g. "Monday: 50% done". */
  readonly accessibleLabel: string;
  /** Completion from 0 to 1, or null when the day has no data. */
  readonly ratio: number | null;
  readonly isToday: boolean;
}

const MIN_BAR_RATIO = 0.12;

/** Bar height as a percentage: clamped to 12-100, with null showing the minimum. */
export function barHeightPercent(ratio: number | null): number {
  return Math.min(1, Math.max(MIN_BAR_RATIO, ratio ?? MIN_BAR_RATIO)) * 100;
}

@Component({
  selector: 'dt-weekly-stat-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block rounded-lg border border-outline-variant bg-surface-variant px-2 py-3',
  },
  template: `
    @if (title(); as title) {
      <h2 class="mb-2 hidden px-2 text-label-large text-on-surface-variant lg:block">
        {{ title }}
      </h2>
    }
    <ul class="grid grid-cols-7">
      @for (day of days(); track day.key) {
        <li class="flex flex-col items-center gap-2" [attr.aria-label]="day.accessibleLabel">
          <div class="flex h-[104px] items-end" aria-hidden="true">
            <div
              class="h-(--dt-bar-height) w-7 max-w-full rounded-full transition-[height] duration-600 ease-out starting:h-0"
              [class]="day.isToday ? 'bg-primary' : 'bg-primary/25'"
              [style.--dt-bar-height]="barHeight(day.ratio) + '%'"
            ></div>
          </div>
          <span
            class="text-label-medium"
            aria-hidden="true"
            [class]="day.isToday ? 'font-bold text-primary' : 'text-on-surface-variant'"
          >
            {{ day.label }}
          </span>
        </li>
      }
    </ul>
  `,
})
export class WeeklyStatView {
  readonly days = input.required<readonly WeeklyStatDay[]>();
  /** Heading shown from `lg`, where the chart sits in a rail without surrounding context. */
  readonly title = input<string>();

  protected readonly barHeight = barHeightPercent;
}
