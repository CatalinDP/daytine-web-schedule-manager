import { inject, Injectable, signal } from '@angular/core';
import { isTaskList, Task } from './task.model';
import { LocalStore } from './local-store';

const KEY = 'dt-tasks-v1';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private storage = inject(LocalStore);

  tasks = signal<Task[]>(this.load());

  // Last deleted task and its position, so "Undo" can put it back
  private lastDeleted: { task: Task; index: number } | null = null;

  add(task: Task) {
    this.setTasks([...this.tasks(), { ...task, id: crypto.randomUUID() }]);
  }

  update(task: Task) {
    this.setTasks(this.tasks().map((t) => (t.id === task.id ? task : t)));
  }

  // Marks or unmarks the task as done on one date ("YYYY-MM-DD")
  toggle(id: string, dateKey: string, done: boolean) {
    this.setTasks(
      this.tasks().map((t) => {
        if (t.id !== id) return t;
        const others = t.completedOn.filter((d) => d !== dateKey);
        return { ...t, completedOn: done ? [...others, dateKey] : others };
      }),
    );
  }

  remove(id: string) {
    const index = this.tasks().findIndex((t) => t.id === id);
    if (index === -1) return;
    this.lastDeleted = { task: this.tasks()[index], index };
    this.setTasks(this.tasks().filter((t) => t.id !== id));
  }

  undoDelete() {
    if (!this.lastDeleted) return;
    const list = [...this.tasks()];
    list.splice(this.lastDeleted.index, 0, this.lastDeleted.task);
    this.setTasks(list);
    this.lastDeleted = null;
  }

  replaceAll(tasks: Task[]) {
    this.setTasks(tasks);
    this.lastDeleted = null;
  }

  // Tasks saved before `completedOn` existed had `done: boolean` instead.
  // We give them an empty history so they are not thrown away.
  private load(): Task[] {
    const raw = this.storage.read(KEY, Array.isArray) ?? [];
    const tasks = raw.map((t) =>
      t && typeof t === 'object' && !('completedOn' in t) ? { ...t, completedOn: [] } : t,
    );
    return isTaskList(tasks) ? tasks : [];
  }

  private setTasks(list: Task[]) {
    this.tasks.set(list);
    this.storage.write(KEY, list);
  }
}
