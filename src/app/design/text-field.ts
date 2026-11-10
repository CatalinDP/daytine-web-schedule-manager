import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

let nextId = 0;

/** Outlined field. The fieldset/legend pair cuts a real notch in the border for the label. */
@Component({
  selector: 'dt-text-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="relative">
      <input
        class="block min-h-14 w-full rounded-lg bg-surface px-4 py-2 text-body-large text-on-surface outline-none"
        [id]="id"
        [type]="type()"
        [value]="value()"
        [attr.autocomplete]="autocomplete()"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="error() ? errorId : null"
        [attr.data-dt-initial-focus]="initialFocus() ? '' : null"
        (input)="onInput($event)"
        (focus)="focused.set(true)"
        (blur)="focused.set(false)"
      />

      <fieldset
        class="pointer-events-none absolute inset-x-0 -top-1.5 bottom-0 m-0 rounded-lg px-3 transition-colors duration-200"
        aria-hidden="true"
        [class]="borderClass()"
      >
        <legend
          class="invisible block h-3 overflow-hidden text-label-medium whitespace-nowrap"
          [class]="floated() ? 'max-w-full' : 'max-w-0'"
        >
          <span class="px-1">{{ label() }}</span>
        </legend>
      </fieldset>

      <label
        class="pointer-events-none absolute left-4 max-w-[calc(100%-2rem)] -translate-y-1/2 truncate transition-all duration-200"
        [for]="id"
        [class]="labelClass()"
      >
        {{ label() }}
      </label>
    </div>

    @if (error(); as error) {
      <p class="mt-1 px-4 text-body-small text-error" [id]="errorId">{{ error }}</p>
    }
  `,
})
export class TextField {
  readonly label = input.required<string>();
  readonly value = input('');
  readonly error = input<string | null>(null);
  readonly type = input<'text' | 'email' | 'search'>('text');
  readonly autocomplete = input<string>();
  /** Marks this field as the one a dialog focuses when it opens. */
  readonly initialFocus = input(false);

  readonly valueChange = output<string>();

  protected readonly id = `dt-text-field-${nextId++}`;
  protected readonly errorId = `${this.id}-error`;
  protected readonly focused = signal(false);
  protected readonly floated = computed(() => this.focused() || this.value().length > 0);

  protected readonly borderClass = computed(() => {
    if (this.error()) return this.focused() ? 'border-2 border-error' : 'border border-error';
    return this.focused() ? 'border-2 border-primary' : 'border border-outline';
  });

  protected readonly labelClass = computed(() => {
    const position = this.floated() ? 'top-0 text-label-medium' : 'top-7 text-body-large';
    if (this.error()) return `${position} text-error`;
    return `${position} ${this.focused() ? 'text-primary' : 'text-on-surface-variant'}`;
  });

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
