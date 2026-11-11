import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { TimeValue, padTime } from './time';

type Box = 'hour' | 'minute';

export interface TimeInputLabels {
  readonly hour: string;
  readonly minute: string;
}

const BOX =
  'h-18 w-24 min-w-0 shrink rounded-sm border border-outline bg-surface text-center ' +
  'text-display-time text-on-surface transition-colors duration-200 focus:border-primary ' +
  'lg:h-12 lg:w-16 lg:text-title-large lg:font-normal ' +
  'focus:bg-primary-container focus:text-primary';

@Component({
  selector: 'dt-time-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <fieldset class="min-w-0">
      <legend class="mb-2 text-label-large text-on-surface-variant">{{ label() }}</legend>

      <div class="flex items-center gap-1">
        <input
          class="${BOX}"
          type="text"
          inputmode="numeric"
          maxlength="2"
          autocomplete="off"
          [attr.aria-label]="labels().hour"
          [value]="hourText()"
          (focus)="startEditing($event, 'hour')"
          (input)="onHourInput($event)"
          (blur)="editing.set(null)"
        />
        <span class="text-display-time text-on-surface lg:text-title-large" aria-hidden="true"
          >:</span
        >
        <input
          #minuteBox
          class="${BOX}"
          type="text"
          inputmode="numeric"
          maxlength="2"
          autocomplete="off"
          [attr.aria-label]="labels().minute"
          [value]="minuteText()"
          (focus)="startEditing($event, 'minute')"
          (input)="onMinuteInput($event)"
          (blur)="editing.set(null)"
        />
      </div>
    </fieldset>
  `,
})
export class TimeInput {
  readonly label = input.required<string>();
  readonly labels = input.required<TimeInputLabels>();
  readonly value = input.required<TimeValue>();

  readonly valueChange = output<TimeValue>();

  private minuteBox = viewChild.required<ElementRef<HTMLInputElement>>('minuteBox');

  // Show the raw text while editing, otherwise "1" becomes "01" and blocks the second digit
  protected readonly editing = signal<Box | null>(null);
  private readonly typed = signal('');

  protected readonly hourText = computed(() =>
    this.editing() === 'hour' ? this.typed() : padTime(this.value().hour),
  );
  protected readonly minuteText = computed(() =>
    this.editing() === 'minute' ? this.typed() : padTime(this.value().minute),
  );

  protected startEditing(event: FocusEvent, box: Box) {
    const element = event.target as HTMLInputElement;
    this.typed.set(element.value);
    this.editing.set(box);
    element.select();
  }

  protected onHourInput(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    this.typed.set(text);
    const hour = Number(text);
    if (text === '' || isNaN(hour) || hour > 23) return;

    this.valueChange.emit({ ...this.value(), hour });
    if (text.length === 2) this.minuteBox().nativeElement.focus();
  }

  protected onMinuteInput(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    this.typed.set(text);
    const minute = Number(text);
    if (text === '' || isNaN(minute) || minute > 59) return;

    this.valueChange.emit({ ...this.value(), minute });
  }
}
