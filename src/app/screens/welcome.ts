import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Button } from '../design/button';
import { Icon } from '../design/icon';
import { TextField } from '../design/text-field';
import { TimeInput } from '../design/time-input';
import { ClockService } from '../data/clock.service';
import { STRINGS } from '../mocks/strings';
import { ProfileService } from '../data/profile.store';
import { TimeValue } from '../design/time';

@Component({
  selector: 'dt-welcome',
  imports: [Button, Icon, TextField, TimeInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto flex max-w-5xl flex-col gap-4 p-6 lg:max-w-none lg:p-0">
      <p class="text-title-small text-primary lg:hidden">{{ strings.header(today()) }}</p>

      <!-- From lg this is a split screen: brand panel on the left, form on the right. -->
      <div class="grid gap-4 md:grid-cols-2 md:items-start md:gap-8 lg:min-h-dvh lg:gap-0">
        <div
          class="flex h-[300px] flex-col items-center justify-center gap-4 rounded-lg bg-surface-variant p-4 lg:sticky lg:top-0 lg:h-dvh lg:rounded-none"
        >
          <img class="size-32 rounded-xl" src="logo.svg" alt="" width="128" height="128" />
          <p class="text-center text-title-medium text-secondary lg:text-headline-small">
            {{ strings.hero }}
          </p>
        </div>

        <div
          class="flex w-full min-w-0 flex-col gap-4 lg:mx-auto lg:min-h-dvh lg:max-w-md lg:justify-center lg:px-6 lg:py-10"
        >
          <p class="hidden text-title-small text-primary lg:block">{{ strings.header(today()) }}</p>
          <h1 class="text-title-large text-primary">{{ strings.tagline }}</h1>
          <p class="text-body-medium text-on-surface-variant">{{ strings.intro }}</p>

          <dt-time-input
            [label]="strings.startTime"
            [labels]="timeLabels"
            [value]="startTime()"
            (valueChange)="startTime.set($event)"
          />

          <dt-text-field
            autocomplete="given-name"
            [label]="strings.nameLabel"
            [value]="name()"
            (valueChange)="name.set($event)"
          />

          <section
            class="flex gap-3 rounded-lg bg-secondary-container p-4 text-on-secondary-container"
          >
            <dt-icon name="notifications_active" />
            <div class="flex min-w-0 flex-col gap-1">
              <h2 class="text-title-small">{{ strings.notificationTitle }}</h2>
              <p class="text-body-medium">{{ strings.notificationBody }}</p>
            </div>
          </section>

          <button dt-button type="button" variant="tonal" (click)="finish()">
            {{ strings.cta }}
          </button>
        </div>
      </div>
    </main>
  `,
})
export class Welcome {
  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);

  protected readonly strings = STRINGS.welcome;
  protected readonly timeLabels = STRINGS.time;
  protected readonly today = inject(ClockService).todayLabel;
  protected readonly startTime = signal<TimeValue>(
    this.profileService.user()?.start ?? { hour: 9, minute: 0 },
  );
  protected readonly name = signal(this.profileService.user()?.name ?? '');

  protected finish(): void {
    if (this.name().trim().length < 2) return;
    this.profileService.saveUser(this.name().trim(), this.startTime());
    void this.router.navigate(['/']);
  }
}
