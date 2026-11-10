import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';

import { Button } from './button';
import { Icon, IconName } from './icon';
import { Modal } from './modal';
import { TextField } from './text-field';
import { TimeValue } from './time';
import { TimeInput, TimeInputLabels } from './time-input';

let nextId = 0;

@Component({
  selector: 'dt-app-dialog',
  imports: [Button, Icon, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      class="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl bg-surface-container-high text-on-surface backdrop:bg-scrim/40"
      [dtModal]="open()"
      [attr.aria-labelledby]="titleId"
      (dismissRequested)="cancelled.emit()"
    >
      <div class="flex flex-col gap-4 p-6">
        @if (icon(); as icon) {
          <dt-icon class="self-center text-primary" [name]="icon" />
        }
        <h2 class="text-headline-small" [class.text-center]="icon()" [id]="titleId">
          {{ title() }}
        </h2>

        <div class="flex flex-col gap-2 text-body-medium text-on-surface-variant">
          <ng-content />
        </div>

        <div class="flex flex-wrap justify-end gap-2">
          <button dt-button type="button" variant="text" (click)="cancelled.emit()">
            {{ cancelLabel() }}
          </button>
          @if (confirmLabel(); as confirmLabel) {
            <button
              dt-button
              type="button"
              variant="text"
              [disabled]="confirmDisabled()"
              (click)="confirmed.emit()"
            >
              {{ confirmLabel }}
            </button>
          }
        </div>
      </div>
    </dialog>
  `,
})
export class AppDialog {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly cancelLabel = input.required<string>();
  readonly confirmLabel = input<string>();
  readonly confirmDisabled = input(false);
  readonly icon = input<IconName>();

  readonly cancelled = output<void>();
  readonly confirmed = output<void>();

  protected readonly titleId = `dt-dialog-title-${nextId++}`;
}

export interface DialogOption<T> {
  readonly value: T;
  readonly label: string;
}

// List of options. Clicking one selects it and closes the dialog.
@Component({
  selector: 'dt-option-dialog',
  imports: [AppDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dt-app-dialog
      [open]="open()"
      [title]="title()"
      [cancelLabel]="cancelLabel()"
      (cancelled)="cancelled.emit()"
    >
      <div role="radiogroup" [attr.aria-label]="title()">
        @for (option of options(); track option.value) {
          <button
            type="button"
            role="radio"
            class="flex min-h-12 w-full items-center gap-4 rounded-sm px-2 text-left text-body-large text-on-surface transition-colors duration-200 hover:bg-on-surface/5 focus-visible:-outline-offset-2"
            [attr.aria-checked]="option.value === value()"
            [attr.data-dt-initial-focus]="option.value === value() ? '' : null"
            (click)="selected.emit(option.value)"
          >
            <span
              class="flex size-5 shrink-0 items-center justify-center rounded-full border-2"
              [class]="option.value === value() ? 'border-primary' : 'border-on-surface-variant'"
            >
              @if (option.value === value()) {
                <span class="size-2.5 rounded-full bg-primary"></span>
              }
            </span>
            {{ option.label }}
          </button>
        }
      </div>
    </dt-app-dialog>
  `,
})
export class OptionDialog<T> {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly cancelLabel = input.required<string>();
  readonly options = input.required<readonly DialogOption<T>[]>();
  readonly value = input.required<T>();

  readonly selected = output<T>();
  readonly cancelled = output<void>();
}

@Component({
  selector: 'dt-text-field-dialog',
  imports: [AppDialog, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dt-app-dialog
      [open]="open()"
      [title]="title()"
      [cancelLabel]="cancelLabel()"
      [confirmLabel]="confirmLabel()"
      [confirmDisabled]="trimmed() === ''"
      (cancelled)="cancelled.emit()"
      (confirmed)="confirm()"
    >
      <dt-text-field
        class="mt-2"
        [label]="label()"
        [value]="draft()"
        [initialFocus]="true"
        (valueChange)="draft.set($event)"
        (keydown.enter)="confirm()"
      />
    </dt-app-dialog>
  `,
})
export class TextFieldDialog {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input('');
  readonly cancelLabel = input.required<string>();
  readonly confirmLabel = input.required<string>();

  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  // Resets to `value` every time the dialog opens
  protected readonly draft = linkedSignal({ source: this.open, computation: () => this.value() });
  protected readonly trimmed = computed(() => this.draft().trim());

  protected confirm(): void {
    if (this.trimmed() !== '') this.confirmed.emit(this.trimmed());
  }
}

export interface TimeDialogField {
  readonly label: string;
  readonly value: TimeValue;
}

@Component({
  selector: 'dt-time-input-dialog',
  imports: [AppDialog, TimeInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dt-app-dialog
      [open]="open()"
      [title]="title()"
      [cancelLabel]="cancelLabel()"
      [confirmLabel]="confirmLabel()"
      [confirmDisabled]="error() !== null"
      (cancelled)="cancelled.emit()"
      (confirmed)="confirmed.emit(drafts())"
    >
      @for (field of fields(); track field.label; let index = $index) {
        <dt-time-input
          [label]="field.label"
          [labels]="labels()"
          [value]="drafts()[index]"
          (valueChange)="update(index, $event)"
        />
      }
      @if (error(); as error) {
        <p class="text-label-large text-error" role="alert">{{ error }}</p>
      }
    </dt-app-dialog>
  `,
})
export class TimeInputDialog {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly fields = input.required<readonly TimeDialogField[]>();
  readonly labels = input.required<TimeInputLabels>();
  readonly cancelLabel = input.required<string>();
  readonly confirmLabel = input.required<string>();
  // Returns an error message, or null if the times are OK
  readonly validate = input<(values: readonly TimeValue[]) => string | null>(() => null);

  readonly confirmed = output<readonly TimeValue[]>();
  readonly cancelled = output<void>();

  protected readonly drafts = linkedSignal<boolean, readonly TimeValue[]>({
    source: this.open,
    computation: () => this.fields().map((field) => field.value),
  });
  protected readonly error = computed(() => this.validate()(this.drafts()));

  protected update(index: number, value: TimeValue): void {
    this.drafts.update((drafts) => drafts.map((draft, i) => (i === index ? value : draft)));
  }
}
