import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { AddTaskAction, AppTopBar } from '../design/app-top-bar';
import { Button, IconButton } from '../design/button';
import { Icon } from '../design/icon';
import { DaySelector } from '../design/day-selector';
import { HintBox } from '../design/hint-box';
import { Snackbar } from '../design/snackbar';
import { TaskItem } from '../design/task-item';
import { TaskSheet } from '../design/task-sheet';
import { formatTime, formatTimeRange, toMinutes } from '../design/time';
import { WeekBoard, WeekBoardTaskEvent } from '../design/week-board';
import { EMPTY_TASK, TASK_SHEET_LABELS } from '../mocks/mock-data';
import { STRINGS } from '../mocks/strings';
import { TaskListUi } from './task-list-ui';
import { Task, isDoneOn } from '../data/task.model';
import { ClockService } from '../data/clock.service';
import { addDays, formatWeekRange, weekOf } from '../data/day.model';

// 0 = Monday ... 6 = Sunday
function todayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

@Component({
  selector: 'dt-tasks',
  imports: [
    AddTaskAction,
    AppTopBar,
    Button,
    DaySelector,
    HintBox,
    Icon,
    IconButton,
    Snackbar,
    TaskItem,
    TaskSheet,
    WeekBoard,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-2xl flex-col gap-4 pb-16 lg:mx-0 lg:max-w-[100rem] lg:pb-0">
      <dt-app-top-bar [label]="strings.tasks.label" [title]="today()" [brand]="strings.brand">
        <dt-add-task-action [label]="strings.tasks.addTask" (add)="list.openCreate()" />
      </dt-app-top-bar>

      @if (showHint()) {
        <dt-hint-box
          [title]="strings.hints.deleteTitle"
          [body]="deleteHint"
          [closeLabel]="strings.common.close"
          (dismiss)="showHint.set(false)"
        />
      }

      <!-- Week navigation -->
      <div class="flex items-center gap-1">
        <button
          dt-icon-button
          type="button"
          [attr.aria-label]="strings.tasks.previousWeek"
          (click)="moveWeek(-1)"
        >
          <dt-icon name="arrow_left" />
        </button>
        <p class="text-title-medium text-on-background" aria-live="polite">{{ weekRange() }}</p>
        <button
          dt-icon-button
          type="button"
          [attr.aria-label]="strings.tasks.nextWeek"
          (click)="moveWeek(1)"
        >
          <dt-icon name="arrow_right" />
        </button>
        @if (!isCurrentWeek()) {
          <button dt-button type="button" variant="text" (click)="goToToday()">
            {{ strings.tasks.goToToday }}
          </button>
        }
      </div>

      <!-- Small screens show one day at a time; wide screens show the week board. -->
      <dt-day-selector
        class="fixed inset-x-4 bottom-21 z-10 mx-auto max-w-2xl lg:hidden"
        [dayName]="dayName()"
        [previousLabel]="strings.tasks.previousDay"
        [nextLabel]="strings.tasks.nextDay"
        (previous)="moveDay(-1)"
        (next)="moveDay(1)"
      />

      <div class="flex flex-col gap-2 lg:hidden">
        @for (task of list.tasks(); track task.id) {
          <dt-task-item
            [name]="task.name"
            [timeRange]="timeRange(task)"
            [checked]="list.isDone(task)"
            [isToday]="selectedDay().isToday"
            [deleteLabel]="strings.tasks.delete(task.name)"
            (checkedChange)="list.toggle(task.id, $event)"
            (edit)="list.openEdit(task.id)"
            (delete)="list.remove(task.id)"
          />
        } @empty {
          <p class="py-12 text-center text-body-large text-on-surface-variant">
            {{ strings.tasks.empty }}
          </p>
        }
      </div>

      <!-- "!" is needed because week-board already has the "grid" class -->
      <dt-week-board
        class="hidden! lg:grid!"
        [days]="boardDays()"
        [addText]="strings.tasks.boardAdd"
        [addLabel]="strings.tasks.addToDay"
        [deleteLabel]="strings.tasks.delete"
        (toggled)="onBoardToggle($event)"
        (edit)="onBoardEdit($event)"
        (delete)="onBoardDelete($event)"
        (add)="onBoardAdd($event)"
      />
    </div>

    <dt-task-sheet
      [open]="list.sheetOpen()"
      [task]="list.editingTask()"
      [emptyTask]="emptyTask()"
      [days]="week()"
      [labels]="sheetLabels"
      (saved)="list.save($event)"
      (cancelled)="list.closeSheet()"
      (delete)="list.remove($event)"
    />

    <dt-snackbar
      [lifted]="true"
      [message]="list.snackbar()"
      [actionLabel]="strings.common.undo"
      (action)="list.undoDelete()"
      (dismissed)="list.snackbar.set(null)"
    />
  `,
})
export class Tasks {
  private clock = inject(ClockService);

  protected strings = STRINGS;
  protected today = this.clock.todayLabel;
  protected sheetLabels = TASK_SHEET_LABELS;

  // On touch screens the hint talks about swiping
  protected deleteHint = window.matchMedia('(pointer: coarse)').matches
    ? STRINGS.hints.deleteTouch
    : STRINGS.hints.deletePointer;
  protected showHint = signal(true);

  // Any date inside the week being shown
  private reference = signal(new Date());
  // Passing clock.now() makes "isToday" update by itself at midnight
  protected week = computed(() => weekOf(this.reference(), 'MONDAY', this.clock.now()));
  protected weekRange = computed(() => formatWeekRange(this.week()));
  protected isCurrentWeek = computed(() => this.week().some((d) => d.isToday));

  // Index (0 = Monday) of the day shown on small screens. Starts on today.
  private day = signal(todayIndex());
  protected selectedDay = computed(() => this.week()[this.day()]);
  protected dayName = computed(() => `${this.selectedDay().label} ${this.selectedDay().date}`);

  protected list = new TaskListUi(this.selectedDay);
  protected emptyTask = computed(() => ({ ...EMPTY_TASK, days: [this.selectedDay().id] }));

  protected boardDays = computed(() =>
    this.week().map((day) => ({
      key: day.key,
      label: day.label,
      shortLabel: day.short,
      date: day.date,
      isToday: day.isToday,
      tasks: this.list
        .tasksFor(day.id)
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
        .map((task) => ({
          id: task.id,
          name: task.name,
          time: formatTime(task.start),
          done: isDoneOn(task, day.key),
        })),
    })),
  );

  protected timeRange(task: Task) {
    return formatTimeRange(task.start, task.end);
  }

  protected moveWeek(delta: number) {
    this.reference.set(addDays(this.reference(), delta * 7));
  }

  protected goToToday() {
    this.reference.set(new Date());
    this.day.set(todayIndex());
  }

  // Going back from Monday or forward from Sunday changes the week
  protected moveDay(step: number) {
    const next = this.day() + step;
    if (next < 0) {
      this.moveWeek(-1);
      this.day.set(6);
    } else if (next > 6) {
      this.moveWeek(1);
      this.day.set(0);
    } else {
      this.day.set(next);
    }
  }

  // Board actions first select the column's day, then reuse the list logic
  protected onBoardToggle(event: WeekBoardTaskEvent & { done: boolean }) {
    this.day.set(event.dayIndex);
    this.list.toggle(event.taskId, event.done);
  }

  protected onBoardEdit(event: WeekBoardTaskEvent) {
    this.day.set(event.dayIndex);
    this.list.openEdit(event.taskId);
  }

  protected onBoardDelete(event: WeekBoardTaskEvent) {
    this.day.set(event.dayIndex);
    this.list.remove(event.taskId);
  }

  protected onBoardAdd(dayIndex: number) {
    this.day.set(dayIndex);
    this.list.openCreate();
  }
}
