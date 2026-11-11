import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly supported = typeof Notification !== 'undefined';
  private _permission = signal<NotificationPermission>(
    this.supported ? Notification.permission : 'denied',
  );
  readonly permission = this._permission.asReadonly();
  readonly granted = computed(() => this._permission() === 'granted');

  async request(): Promise<boolean> {
    if (!this.supported) return false;
    if (this._permission() !== 'default') return this.granted();
    try {
      const r = await Notification.requestPermission();
      this._permission.set(r);
      return r === 'granted';
    } catch (e) {
      console.error('Could not request notification permission:', e);
      return false;
    }
  }

  show(title: string, body: string, tag: string): void {
    if (!this.granted()) return;
    try {
      new Notification(title, { body, tag, requireInteraction: false });
    } catch (e) {
      console.error('Could not show notification:', e);
    }
  }
}
