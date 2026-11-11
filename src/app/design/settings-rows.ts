import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { DialogOption } from './app-dialog';
import { Button } from './button';
import { Icon } from './icon';

const ROW_FOCUS = 'focus-visible:-outline-offset-2';

@Component({
  selector: 'dt-section-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h2 class="text-title-small text-primary"><ng-content /></h2>`,
})
export class SectionTitle {}

@Component({
  selector: 'dt-card-setting-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'block overflow-hidden rounded-lg bg-on-secondary shadow-card [&>*]:relative [&>*]:block ' +
      'lg:border lg:border-outline-variant lg:shadow-none ' +
      '[&>*+*]:before:absolute [&>*+*]:before:inset-x-3 [&>*+*]:before:top-0 ' +
      '[&>*+*]:before:h-px [&>*+*]:before:bg-outline-variant',
  },
  template: '<ng-content />',
})
export class CardSettingContainer {}

@Component({
  selector: 'dt-single-line-setting-button',
  imports: [Icon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #content>
      <span class="min-w-0 flex-1 text-title-medium text-on-surface lg:text-title-small">{{
        label()
      }}</span>
      @if (value(); as value) {
        <span class="min-w-0 text-right text-label-large text-secondary">{{ value }}</span>
      }
    </ng-template>

    @if (interactive()) {
      <button
        type="button"
        class="${ROW_FOCUS} flex min-h-14 w-full items-center gap-3 p-3 text-left transition-colors duration-200 hover:bg-on-surface/5 lg:min-h-12 lg:py-2"
        (click)="pressed.emit()"
      >
        <ng-container [ngTemplateOutlet]="content" />
        <dt-icon class="text-on-surface-variant" name="arrow_right" />
      </button>
    } @else {
      <div class="flex min-h-14 items-center gap-3 p-3 lg:min-h-12 lg:py-2">
        <ng-container [ngTemplateOutlet]="content" />
      </div>
    }
  `,
})
export class SingleLineSettingButton {
  readonly label = input.required<string>();
  readonly value = input<string>();
  readonly interactive = input(true);

  readonly pressed = output<void>();
}

@Component({
  selector: 'dt-double-line-setting',
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-3 lg:flex lg:items-center lg:justify-between lg:gap-3 lg:py-2">
      <p class="text-title-medium text-on-surface lg:flex-1 lg:text-title-small">{{ label() }}</p>
      <div class="flex flex-wrap items-center justify-between gap-x-3 lg:gap-x-4">
        <p class="text-label-medium text-secondary">{{ state() }}</p>
        <button
          dt-button
          type="button"
          variant="text"
          class="-mr-3 ml-auto"
          (click)="action.emit()"
        >
          {{ actionLabel() }}
        </button>
      </div>
    </div>
  `,
})
export class DoubleLineSetting {
  readonly label = input.required<string>();
  readonly state = input.required<string>();
  readonly actionLabel = input.required<string>();

  readonly action = output<void>();
}

@Component({
  selector: 'dt-switch-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="switch"
      class="${ROW_FOCUS} flex min-h-[60px] w-full items-center justify-between gap-3 p-3 text-left transition-colors duration-200 hover:bg-on-surface/5 lg:min-h-12 lg:py-2"
      [attr.aria-checked]="checked()"
      (click)="checkedChange.emit(!checked())"
    >
      <span class="min-w-0 text-title-medium text-on-surface lg:text-title-small">{{
        label()
      }}</span>
      <span
        class="flex h-8 w-13 shrink-0 items-center rounded-full border-2 transition-colors duration-200"
        [class]="
          checked()
            ? 'border-primary bg-primary-container'
            : 'border-outline bg-surface-container-highest'
        "
      >
        <span
          class="size-5 rounded-full transition-[translate,background-color] duration-200"
          [class]="checked() ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-secondary'"
        ></span>
      </span>
    </button>
  `,
})
export class SwitchRow {
  readonly label = input.required<string>();
  readonly checked = input.required<boolean>();

  readonly checkedChange = output<boolean>();
}

let nextOptionSettingId = 0;

@Component({
  selector: 'dt-option-setting',
  imports: [SingleLineSettingButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dt-single-line-setting-button
      class="lg:hidden"
      [label]="label()"
      [value]="selectedLabel()"
      (pressed)="pressed.emit()"
    />

    <div class="hidden min-h-12 items-center justify-between gap-3 px-3 py-1.5 lg:flex">
      <span class="min-w-0 text-title-small text-on-surface" [id]="labelId">{{ label() }}</span>
      <div
        class="flex rounded-full border border-outline p-0.5"
        role="radiogroup"
        [attr.aria-labelledby]="labelId"
      >
        @for (option of options(); track option.value) {
          <label class="relative">
            <input
              type="radio"
              class="peer absolute -top-0.5 left-0 m-0 h-11 w-full cursor-pointer opacity-0"
              [name]="labelId"
              [checked]="option.value === selected()"
              (change)="selectedChange.emit(option.value)"
            />
            <span
              class="flex min-h-10 items-center rounded-full px-4 text-label-large text-on-surface-variant transition-colors duration-200 peer-checked:bg-secondary-container peer-checked:text-on-secondary-container peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
            >
              {{ option.label }}
            </span>
          </label>
        }
      </div>
    </div>
  `,
})
export class OptionSetting<T> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly DialogOption<T>[]>();
  readonly selected = input.required<T>();

  readonly pressed = output<void>();
  readonly selectedChange = output<T>();

  protected readonly labelId = `dt-option-setting-${nextOptionSettingId++}`;
  protected readonly selectedLabel = computed(
    () => this.options().find((option) => option.value === this.selected())?.label ?? '',
  );
}
