import { effect, inject, Injectable } from '@angular/core';
import { ClockService } from './clock.service';
import { TaskService } from './task.store';
import { NotificationService } from './notifications.service';
import { LocalStore } from './local-store';
import { dateKey } from './day.model';
import { formatTime, toMinutes } from '../design/time';
import { STRINGS } from '../mocks/strings';
import { isDoneOn } from './task.model';

const SENT_KEY = 'dt-notif-v1';
const TOLERANCE = 5; // minutes

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

@Injectable({ providedIn: 'root' })
export class TaskNotifierService {
  private clock = inject(ClockService);
  private tasks = inject(TaskService);
  private notifications = inject(NotificationService);
  private storage = inject(LocalStore);

  private sent = new Set(this.storage.read(SENT_KEY, isStringArray));

  constructor() {
    effect(() => {
      const now = this.clock.now();
      const minutes = this.clock.nowMinutes();
      const tasks = this.tasks.tasks();

      if (!this.notifications.granted()) return;

      const today = this.clock.todayId();
      const key = dateKey(now);
      let wasSent = false;

      for (const t of tasks) {
        if (isDoneOn(t, key) || !t.days.includes(today)) continue;

        const diff = minutes - toMinutes(t.start);
        if (diff < 0 || diff > TOLERANCE) continue;

        const mark = `${t.id}@${key}`;
        if (this.sent.has(mark)) continue;

        this.notifications.show(
          t.name,
          STRINGS.notifications.taskStarts(formatTime(t.start)),
          mark,
        );
        this.sent.add(mark);
        wasSent = true;
      }

      if (wasSent) this.saveMarks(key);
    });
  }

  private saveMarks(today: string): void {
    // Keep only today's marks so the record doesn't grow forever
    const kept = [...this.sent].filter((m) => m.endsWith(`@${today}`));
    this.sent = new Set(kept);
    this.storage.write(SENT_KEY, kept);
  }
}
