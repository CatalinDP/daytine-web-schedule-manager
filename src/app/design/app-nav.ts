import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon, IconName } from './icon';

export interface NavItem {
  readonly route: string;
  readonly label: string;
  readonly icon: IconName;
}

const PILL =
  'flex min-h-12 items-center rounded-full px-4 py-3 text-label-large transition-colors duration-200';
const SIDEBAR_ITEM =
  'flex min-h-11 items-center rounded-md px-3 py-2 text-label-large transition-colors duration-200';
const PILL_SELECTED = 'bg-primary-container text-on-primary-container';
const PILL_UNSELECTED = 'text-on-surface-variant hover:bg-current/10';

@Component({
  selector: 'dt-nav-bar',
  imports: [Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      class="flex items-center justify-around gap-1 rounded-xl bg-surface-container p-2 shadow-nav"
      [attr.aria-label]="ariaLabel()"
    >
      @for (item of items(); track item.route) {
        <a
          class="${PILL} min-w-0 justify-center"
          [class]="item.route === selected() ? '${PILL_SELECTED}' : '${PILL_UNSELECTED}'"
          [routerLink]="item.route"
          [attr.aria-current]="item.route === selected() ? 'page' : null"
        >
          <dt-icon [name]="item.icon" />
          <span
            class="grid min-w-0 transition-[grid-template-columns] duration-300 ease-out"
            [class]="item.route === selected() ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'"
          >
            <span class="min-w-0 overflow-hidden whitespace-nowrap">
              <span class="pl-2">{{ item.label }}</span>
            </span>
          </span>
        </a>
      }
    </nav>
  `,
})
export class NavBar {
  readonly items = input.required<readonly NavItem[]>();
  readonly selected = input.required<string>();
  readonly ariaLabel = input.required<string>();
}

@Component({
  selector: 'dt-nav-sidebar',
  imports: [Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      class="flex h-full flex-col gap-1 border-r border-outline-variant bg-surface-container-low p-3"
      [attr.aria-label]="ariaLabel()"
    >
      @if (brand(); as brand) {
        <div class="mb-3 flex items-center gap-3 px-2 py-2">
          <img class="size-8 rounded-sm" src="logo.svg" alt="" width="32" height="32" />
          <span class="text-title-medium text-on-surface">{{ brand }}</span>
        </div>
      }

      @for (item of items(); track item.route) {
        <a
          class="${SIDEBAR_ITEM} gap-3"
          [class]="item.route === selected() ? '${PILL_SELECTED}' : '${PILL_UNSELECTED}'"
          [routerLink]="item.route"
          [attr.aria-current]="item.route === selected() ? 'page' : null"
        >
          <dt-icon [name]="item.icon" [size]="20" />
          {{ item.label }}
        </a>
      }

      @if (profile(); as profile) {
        <a
          class="mt-auto flex min-h-12 items-center gap-3 rounded-md px-2 transition-colors duration-200 hover:bg-on-surface/5"
          [routerLink]="profile.route"
        >
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-title-small text-on-secondary-container"
            aria-hidden="true"
          >
            {{ profile.name.charAt(0) }}
          </span>
          <span class="min-w-0 text-label-large text-on-surface">{{ profile.name }}</span>
        </a>
      }
    </nav>
  `,
})
export class NavSidebar {
  readonly items = input.required<readonly NavItem[]>();
  readonly selected = input.required<string>();
  readonly ariaLabel = input.required<string>();
  readonly brand = input<string>();
  readonly profile = input<{ readonly name: string; readonly route: string }>();
}
