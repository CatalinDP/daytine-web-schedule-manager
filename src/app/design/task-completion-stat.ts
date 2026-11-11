import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

@Component({
  selector: 'dt-task-completion-stat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex min-h-30 items-center gap-[18px] rounded-lg border border-outline-variant ' +
      'bg-surface-container-high p-4',
  },
  template: `
    <div class="relative size-[100px] shrink-0">
      <svg class="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          class="stroke-on-surface-variant"
          cx="50"
          cy="50"
          fill="none"
          stroke-width="12"
          [attr.r]="radius"
        />
        @if (percent() > 0) {
          <circle
            class="stroke-tertiary transition-[stroke-dashoffset] duration-800 ease-out [stroke-dashoffset:var(--dt-ring-offset)] starting:[stroke-dashoffset:var(--dt-ring-empty)]"
            cx="50"
            cy="50"
            fill="none"
            stroke-linecap="round"
            stroke-width="12"
            [attr.r]="radius"
            [attr.stroke-dasharray]="circumference"
            [style.--dt-ring-empty]="circumference"
            [style.--dt-ring-offset]="offset()"
          />
        }
      </svg>
      <span
        class="absolute inset-0 flex items-center justify-center text-title-medium text-on-surface"
      >
        {{ percent() }}%
      </span>
    </div>

    <div class="flex min-w-0 flex-col gap-2">
      <p class="text-label-large text-on-surface-variant">{{ label() }}</p>
      <p class="text-title-large text-on-surface">{{ summary() }}</p>
      <p class="text-label-medium text-primary">{{ message() }}</p>
    </div>
  `,
})
export class TaskCompletionStat {
  readonly percent = input.required<number>();
  readonly label = input.required<string>();
  readonly summary = input.required<string>();
  readonly message = input.required<string>();

  protected readonly radius = RING_RADIUS;
  protected readonly circumference = RING_CIRCUMFERENCE;
  protected readonly offset = computed(() => RING_CIRCUMFERENCE * (1 - this.percent() / 100));
}
