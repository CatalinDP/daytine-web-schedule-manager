import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

import { IconButton } from './button';
import { Icon } from './icon';

const SWIPE_DELETE_DISTANCE_PX = 96;
const SWIPE_START_SLOP_PX = 8;

let nextId = 0;

@Component({
  selector: 'dt-task-item',
  imports: [Icon, IconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'group relative block' },
  template: `
    @if (dragX() < 0) {
      <div
        class="absolute inset-0 flex items-center justify-end rounded-lg bg-error pr-6 text-on-error"
      >
        <dt-icon name="delete" />
      </div>
    }

    <div
      class="relative flex min-h-16 touch-pan-y items-center rounded-lg bg-on-secondary py-1 shadow-card"
      [class]="
        tableRow() ? 'lg:min-h-13 lg:rounded-none lg:bg-transparent lg:py-0 lg:shadow-none' : ''
      "
      [class.transition-transform]="dragX() === 0"
      [class.duration-200]="dragX() === 0"
      [style.transform]="dragX() ? 'translateX(' + dragX() + 'px)' : null"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp()"
      (pointercancel)="resetSwipe()"
    >
      <span class="relative mx-3 flex size-11 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          class="peer absolute inset-0 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          [checked]="checked()"
          [disabled]="!isToday()"
          [attr.aria-labelledby]="nameId"
          (change)="onCheckedChange($event)"
        />
        <span
          class="flex size-5 items-center justify-center rounded-xs border-2 border-outline text-on-primary transition-colors duration-200 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-disabled:opacity-40"
        >
          @if (checked()) {
            <dt-icon name="check" [size]="16" />
          }
        </span>
      </span>

      <button
        type="button"
        class="flex min-h-14 min-w-0 flex-1 flex-col justify-center rounded-md py-1 pr-2 text-left text-on-surface lg:min-h-11 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-4"
        (click)="edit.emit()"
      >
        <span [id]="nameId" class="text-label-large">{{ name() }}</span>
        <span class="text-label-medium text-on-surface-variant">{{ timeRange() }}</span>
      </button>

      <button
        dt-icon-button
        type="button"
        class="mr-1 text-error opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:pointer-events-none"
        [attr.aria-label]="deleteLabel()"
        (click)="delete.emit()"
      >
        <dt-icon name="delete" />
      </button>
    </div>
  `,
})
export class TaskItem {
  readonly name = input.required<string>();
  readonly timeRange = input.required<string>();
  readonly deleteLabel = input.required<string>();
  readonly checked = input(false);
  readonly isToday = input(true);
  readonly tableRow = input(false);

  readonly checkedChange = output<boolean>();
  readonly edit = output<void>();
  readonly delete = output<void>();

  protected readonly nameId = `dt-task-name-${nextId++}`;
  protected readonly dragX = signal(0);

  private swipeStartX: number | null = null;

  protected onCheckedChange(event: Event): void {
    this.checkedChange.emit((event.target as HTMLInputElement).checked);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'touch') this.swipeStartX = event.clientX;
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.swipeStartX === null) return;

    const distance = Math.min(0, event.clientX - this.swipeStartX);
    if (this.dragX() === 0 && distance > -SWIPE_START_SLOP_PX) return;

    // Capturing keeps the release on the card, so a swipe never clicks the name button.
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    this.dragX.set(distance);
  }

  protected onPointerUp(): void {
    const shouldDelete = this.dragX() <= -SWIPE_DELETE_DISTANCE_PX;
    this.resetSwipe();
    if (shouldDelete) this.delete.emit();
  }

  protected resetSwipe(): void {
    this.swipeStartX = null;
    this.dragX.set(0);
  }
}
