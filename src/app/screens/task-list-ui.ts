import { Signal, computed, inject, signal } from '@angular/core';

import { Day, Task, isDoneOn } from '../data/task.model';
import { WeekDay } from '../data/day.model';
import { TaskService } from '../data/task.store';
import { STRINGS } from '../mocks/strings';

export class TaskListUi {
  private taskService = inject(TaskService);
  private editingId = signal<string | null>(null);

  sheetOpen = signal(false);
  snackbar = signal<string | null>(null);

  tasks = computed(() => this.tasksFor(this.day().id));
  editingTask = computed(() => this.tasks().find((t) => t.id === this.editingId()) ?? null);

  constructor(private day: Signal<WeekDay>) {}

  tasksFor(day: Day): Task[] {
    return this.taskService.tasks().filter((t) => t.days.includes(day));
  }

  openCreate() {
    this.editingId.set(null);
    this.sheetOpen.set(true);
  }

  openEdit(id: string) {
    this.editingId.set(id);
    this.sheetOpen.set(true);
  }

  closeSheet() {
    this.sheetOpen.set(false);
  }

  isDone(task: Task): boolean {
    return isDoneOn(task, this.day().key);
  }

  toggle(id: string, done: boolean) {
    this.taskService.toggle(id, this.day().key, done);
  }

  save(task: Task) {
    if (this.editingId()) {
      this.taskService.update(task);
    } else {
      this.taskService.add(task);
    }
    this.closeSheet();
  }

  remove(id: string) {
    const task = this.taskService.tasks().find((t) => t.id === id);
    if (!task) return;
    this.taskService.remove(id);
    this.snackbar.set(STRINGS.tasks.deleted(task.name));
    this.closeSheet();
  }

  undoDelete() {
    this.taskService.undoDelete();
    this.snackbar.set(null);
  }
}
