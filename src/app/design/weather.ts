import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icon } from './icon';

export type WeatherIcon =
  'wb_sunny' | 'wb_cloudy' | 'cloud' | 'umbrella' | 'ac_unit' | 'thunderstorm';

@Component({
  selector: 'dt-weather',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex items-center gap-[18px] rounded-lg border border-inverse-primary ' +
      'bg-primary-container p-2 text-on-primary-container',
  },
  template: `
    <dt-icon [name]="icon()" />

    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <p class="text-label-large text-on-primary-container/80">{{ title() }}</p>
      <p class="text-title-large">{{ temperature() }}</p>
      <p class="text-label-medium">{{ rainChance() }}</p>
    </div>

    <div class="flex shrink-0 flex-col gap-2 text-right text-label-large">
      <p>{{ max() }}</p>
      <p>{{ min() }}</p>
    </div>
  `,
})
export class Weather {
  readonly icon = input.required<WeatherIcon>();
  readonly title = input.required<string>();
  readonly temperature = input.required<string>();
  readonly rainChance = input.required<string>();
  readonly max = input.required<string>();
  readonly min = input.required<string>();
}
