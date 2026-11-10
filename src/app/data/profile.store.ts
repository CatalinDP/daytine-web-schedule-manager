import { inject, Injectable, signal } from '@angular/core';
import { LocalStore } from './local-store';
import { isUser, User } from './profile.model';
import { TimeValue } from '../design/time';

const KEY = 'dt-user-v1';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private storage = inject(LocalStore);

  user = signal<User | null>(this.storage.read(KEY, isUser));

  saveUser(name: string, start: TimeValue) {
    const current = this.user();
    const user = { id: current?.id ?? crypto.randomUUID(), name, start };
    this.user.set(user);
    this.storage.write(KEY, user);
  }

  updateName(name: string) {
    const current = this.user();
    if (current) this.saveUser(name, current.start);
  }

  updateStart(start: TimeValue) {
    const current = this.user();
    if (current) this.saveUser(current.name, start);
  }
}
