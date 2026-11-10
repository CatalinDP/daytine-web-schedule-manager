import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';

import { TimeValue, padTime } from './time';

export interface TimeInputLabels {
  readonly hour: string;
  readonly minute: string;
}

const BOX =
  'h-18 w-24 min-w-0 shrink rounded-sm border border-outline bg-surface text-center ' +
  'text-display-time text-on-surface transition-colors duration-200 focus:border-primary ' +
  'lg:h-12 lg:w-16 lg:text-title-large lg:font-normal ' +
  'focus:bg-primary-container focus:text-primary';

// Two text boxes (hours and minutes) in 24h format
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
          [value]="pad(value().hour)"
          (focus)="selectAll($event)"
          (input)="onHourInput($event)"
          (blur)="resetBox($event, value().hour)"
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
          [value]="pad(value().minute)"
          (focus)="selectAll($event)"
          (input)="onMinuteInput($event)"
          (blur)="resetBox($event, value().minute)"
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

  protected pad(n: number) {
    return padTime(n);
  }

  protected selectAll(event: FocusEvent) {
    (event.target as HTMLInputElement).select();
  }

  protected onHourInput(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    const hour = Number(text);
    if (text === '' || isNaN(hour) || hour > 23) return;

    this.valueChange.emit({ ...this.value(), hour });
    // When two digits are typed, jump to the minutes box
    if (text.length === 2) this.minuteBox().nativeElement.focus();
  }

  protected onMinuteInput(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    const minute = Number(text);
    if (text === '' || isNaN(minute) || minute > 59) return;

    this.valueChange.emit({ ...this.value(), minute });
  }

  // On blur, show the saved value again (e.g. if the user typed "99")
  protected resetBox(event: FocusEvent, n: number) {
    (event.target as HTMLInputElement).value = padTime(n);
  }
}
