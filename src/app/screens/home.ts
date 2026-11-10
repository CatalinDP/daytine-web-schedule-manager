import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AddTaskAction, AppTopBar } from '../design/app-top-bar';
import { Button } from '../design/button';
import { HintBox } from '../design/hint-box';
import { Snackbar } from '../design/snackbar';
import { SuggestionBox } from '../design/suggestion-box';
import { TaskCompletionStat } from '../design/task-completion-stat';
import { TaskItem } from '../design/task-item';
import { TaskSheet } from '../design/task-sheet';
import { formatTimeRange } from '../design/time';
import { Weather } from '../design/weather';
import { WeeklyStatView } from '../design/weekly-stat-view';
import {
  EMPTY_TASK,
  HOME_HINTS,
  STREAK_DAYS,
  TASK_SHEET_LABELS,
  WEATHER,
} from '../mocks/mock-data';
import { STRINGS } from '../mocks/strings';
import { TaskListUi } from './task-list-ui';
import { ProfileService } from '../data/profile.store';
import { weekOf } from '../data/day.model';
import { ClockService } from '../data/clock.service';
import { Task, isDoneOn } from '../data/task.model';

@Component({
  selector: 'dt-home',
  imports: [
    AddTaskAction,
    AppTopBar,
    Button,
    HintBox,
    RouterLink,
    Snackbar,
    SuggestionBox,
    TaskCompletionStat,
    TaskItem,
    TaskSheet,
    Weather,
    WeeklyStatView,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-[70rem] flex-col gap-4 lg:mx-0 lg:max-w-[100rem]">
      <dt-app-top-bar
        [label]="strings.home.greeting(userName)"
        [title]="today()"
        [brand]="strings.brand"
      >
        <dt-add-task-action
          class="hidden lg:block"
          [label]="strings.tasks.addTask"
          (add)="list.openCreate()"
        />
      </dt-app-top-bar>

      @if (currentHint(); as hint) {
        <dt-hint-box
          [title]="hint.title"
          [body]="hint.body"
          [actionLabel]="hint.actionLabel"
          [closeLabel]="strings.common.close"
          (action)="nextHint()"
          (dismiss)="nextHint()"
        />
      }

      <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-6">
        <div class="flex min-w-0 flex-col gap-4">
          <dt-task-completion-stat
            [percent]="percent()"
            [label]="strings.home.statLabel"
            [summary]="strings.home.statSummary(doneCount(), list.tasks().length)"
            [message]="strings.home.statMessage"
          />

          <dt-weekly-stat-view [days]="weeklyStats()" [title]="strings.home.thisWeek" />

          <dt-suggestion-box
            icon="local_fire_department"
            [title]="streakDays > 0 ? strings.home.streak(streakDays) : strings.home.streakEmpty"
          />

          <dt-weather
            [icon]="forecast.icon"
            [title]="strings.weather.title"
            [temperature]="forecast.temperature"
            [rainChance]="strings.weather.rainChance(forecast.rain)"
            [max]="strings.weather.max(forecast.max)"
            [min]="strings.weather.min(forecast.min)"
          />
        </div>

        <section class="flex min-w-0 flex-col gap-2" aria-labelledby="dt-upcoming-title">
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-title-medium text-on-background" id="dt-upcoming-title">
              {{ strings.home.upcoming }}
            </h2>
            <a dt-button variant="text" class="-mr-3" routerLink="/tasks">
              {{ strings.home.seeMore }}
            </a>
          </div>

          <div
            class="flex flex-col gap-2 lg:gap-0 lg:divide-y lg:divide-outline-variant lg:rounded-lg lg:border lg:border-outline-variant lg:bg-on-secondary"
          >
            @for (task of list.tasks(); track task.id) {
              <dt-task-item
                [tableRow]="true"
                [name]="task.name"
                [timeRange]="timeRange(task)"
                [checked]="list.isDone(task)"
                [deleteLabel]="strings.tasks.delete(task.name)"
                (checkedChange)="list.toggle(task.id, $event)"
                (edit)="list.openEdit(task.id)"
                (delete)="list.remove(task.id)"
              />
            } @empty {
              <p class="py-6 text-center text-body-medium text-on-surface-variant">
                {{ strings.tasks.empty }}
              </p>
            }
          </div>
        </section>
      </div>
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
      [message]="list.snackbar()"
      [actionLabel]="strings.common.undo"
      (action)="list.undoDelete()"
      (dismissed)="list.snackbar.set(null)"
    />
  `,
})
export class Home {
  private profile = inject(ProfileService);
  private clock = inject(ClockService);

  protected strings = STRINGS;
  protected userName = this.profile.user()?.name ?? '';
  protected today = this.clock.todayLabel;
  protected forecast = WEATHER;
  protected streakDays = STREAK_DAYS;
  protected week = computed(() => weekOf(this.clock.now(), 'MONDAY', this.clock.now()));
  protected emptyTask = computed(() => ({ ...EMPTY_TASK, days: [this.clock.todayId()] }));
  protected sheetLabels = TASK_SHEET_LABELS;

  // Home always shows today's tasks (it changes by itself at midnight)
  private todayInWeek = computed(() => this.week().find((d) => d.isToday)!);
  protected list = new TaskListUi(this.todayInWeek);

  // Part of each day's tasks that was completed. Future days and days without tasks show no data.
  protected weeklyStats = computed(() => {
    const todayKey = this.todayInWeek().key;
    return this.week().map((day) => {
      const tasks = this.list.tasksFor(day.id);
      const done = tasks.filter((t) => isDoneOn(t, day.key)).length;
      const ratio = day.key > todayKey || tasks.length === 0 ? null : done / tasks.length;
      return {
        key: day.key,
        label: day.narrow,
        accessibleLabel:
          ratio === null
            ? `${day.label}: no data`
            : `${day.label}: ${Math.round(ratio * 100)}% done`,
        ratio,
        isToday: day.isToday,
      };
    });
  });

  private hintIndex = signal(0);
  protected currentHint = computed(() => HOME_HINTS[this.hintIndex()]);

  protected doneCount = computed(() => this.list.tasks().filter((t) => this.list.isDone(t)).length);
  protected percent = computed(() => {
    const total = this.list.tasks().length;
    return total === 0 ? 0 : Math.round((this.doneCount() / total) * 100);
  });

  protected timeRange(task: Task) {
    return formatTimeRange(task.start, task.end);
  }

  protected nextHint() {
    this.hintIndex.set(this.hintIndex() + 1);
  }
}
