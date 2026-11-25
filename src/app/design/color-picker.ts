import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { Icon } from './icon';
import { TAG_PALETTE, TagId } from '../data/tag.model';
import { TAG_STYLES } from './color-tags';

let nextId = 0;

@Component({
  selector: 'dt-color-picker',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="m-0 min-w-0 border-0 p-0">
      <legend class="text-label-large text-on-surface-variant">{{ legend() }}</legend>
      <div class="grid grid-cols-4 gap-x-2 gap-y-3 md:grid-cols-8">
        @for (opt of options(); track opt.id) {
          <label class="relative flex min-w-0 cursor-pointer flex-col items-center gap-1 py-1">
            <input
              type="radio"
              [name]="listId"
              class="peer sr-only"
              [checked]="selected() === opt.id"
              (change)="selectedChange.emit(opt.id)"
            />
            <span
              class="flex size-8 justify-center items-center rounded-full motion-safe:transition motion-safe:hover:scale-110 
            peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary
            peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-offset-surface-container-low peer-checked:ring-on-surface
            "
              [class]="opt.swatch"
            >
              @if (selected() === opt.id) {
                <dt-icon name="check" [size]="20" [class]="opt.onSwatch" />
              }
            </span>
            <span class="text-center text-label-medium text-on-surface-variant wrap-normal">
              {{ opt.name }}
            </span>
          </label>
        }
      </div>
    </fieldset>
  `,
})
export class ColorPicker {
  private readonly palette = inject(TAG_PALETTE);
  readonly legend = input.required<string>();
  readonly selected = input.required<TagId>();
  readonly names = input.required<Record<TagId, string>>();

  readonly selectedChange = output<TagId>();
  protected readonly listId = `dt-color-picker-${nextId++}`;

  protected readonly options = computed(() =>
    this.palette.map((id) => ({
      id,
      name: this.names()[id],
      ...TAG_STYLES[id],
    })),
  );
}
