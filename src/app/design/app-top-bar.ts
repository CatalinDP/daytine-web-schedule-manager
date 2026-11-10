import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { IconButton } from './button';
import { Icon } from './icon';

const DESKTOP_HEADING = 'lg:text-headline-small lg:text-on-background';
const DESKTOP_SUBTITLE = 'lg:text-body-medium lg:text-on-surface-variant';
const PINNED =
  'lg:fixed lg:inset-x-0 lg:top-0 lg:z-20 lg:h-16 lg:border-b lg:border-outline-variant ' +
  'lg:pr-8 lg:pl-5';

/** Screen header. Project trailing actions as content. */
@Component({
  selector: 'dt-app-top-bar',
  imports: [Icon, IconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex min-h-16 items-center gap-2 bg-background lg:gap-4',
    '[class]': 'pinnedClass()',
  },
  template: `
    @if (brand(); as brand) {
      <!-- Same width as the sidebar, so the heading lines up with the page content. -->
      <div class="mr-4 hidden w-55 shrink-0 items-center gap-3 px-2 lg:flex">
        <img class="size-8 rounded-sm" src="logo.svg" alt="" width="32" height="32" />
        <span class="text-title-medium text-on-surface">{{ brand }}</span>
      </div>
    }

    @if (backLabel(); as backLabel) {
      <button
        dt-icon-button
        type="button"
        class="-ml-2 text-on-background"
        [attr.aria-label]="backLabel"
        (click)="back.emit()"
      >
        <dt-icon name="arrow_back" />
      </button>
    }

    <h1 class="flex min-w-0 flex-1" [class]="headingLayout()">
      <span class="text-label-medium text-on-background" [class]="labelClass()">{{ label() }}</span>
      <span class="text-title-medium text-primary" [class]="titleClass()">{{ title() }}</span>
    </h1>

    <ng-content />
  `,
})
export class AppTopBar {
  readonly label = input.required<string>();
  readonly title = input.required<string>();
  /** Which line becomes the page heading from `lg`. The other one turns into a subtitle. */
  readonly desktopHeading = input<'label' | 'title'>('label');
  /** Shows the back button when set. */
  readonly backLabel = input<string>();
  /** Pins the bar across the top of the app from `lg`, led by the brand. */
  readonly brand = input<string>();

  readonly back = output<void>();

  protected readonly pinnedClass = computed(() => (this.brand() ? PINNED : ''));
  protected readonly headingLayout = computed(() =>
    this.desktopHeading() === 'label' ? 'flex-col' : 'flex-col lg:flex-col-reverse',
  );
  protected readonly labelClass = computed(() =>
    this.desktopHeading() === 'label' ? DESKTOP_HEADING : DESKTOP_SUBTITLE,
  );
  protected readonly titleClass = computed(() =>
    this.desktopHeading() === 'label' ? DESKTOP_SUBTITLE : DESKTOP_HEADING,
  );
}

@Component({
  selector: 'dt-add-task-action',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="relative flex min-h-11 min-w-11 flex-col items-center justify-center rounded-md px-2 py-1 text-primary transition-colors duration-200 hover:bg-primary/10 after:absolute after:inset-x-0 after:-inset-y-0.5 lg:min-h-10 lg:flex-row lg:gap-2 lg:rounded-full lg:bg-primary lg:py-2 lg:pr-6 lg:pl-4 lg:text-on-primary lg:hover:bg-primary/90"
      (click)="add.emit()"
    >
      <dt-icon name="add_circle" />
      <span class="text-label-medium lg:text-label-large">{{ label() }}</span>
    </button>
  `,
})
export class AddTaskAction {
  readonly label = input.required<string>();

  readonly add = output<void>();
}
