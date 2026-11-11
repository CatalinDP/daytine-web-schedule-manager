import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { NavBar, NavSidebar } from '../design/app-nav';
import { NAV_ITEMS } from '../mocks/mock-data';
import { STRINGS } from '../mocks/strings';
import { ProfileService } from '../data/profile.store';

function pathOf(url: string): string {
  return url.split(/[?#]/)[0];
}

@Component({
  selector: 'dt-shell',
  imports: [NavBar, NavSidebar, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="sr-only z-50 rounded-full bg-primary text-label-large text-on-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-6 focus:py-3"
      (click)="skipToContent()"
    >
      {{ strings.common.skipToContent }}
    </button>

    <dt-nav-sidebar
      class="fixed top-16 bottom-0 left-0 hidden w-60 lg:block"
      [items]="items"
      [selected]="currentPath()"
      [ariaLabel]="strings.nav.ariaLabel"
      [profile]="profile()"
    />

    <main
      #main
      class="px-6 pt-2 pb-28 outline-none lg:ml-60 lg:px-8 lg:pt-22 lg:pb-8"
      tabindex="-1"
    >
      <router-outlet />
    </main>

    <dt-nav-bar
      class="fixed inset-x-4 bottom-3 z-20 lg:hidden"
      [items]="items"
      [selected]="currentPath()"
      [ariaLabel]="strings.nav.ariaLabel"
    />
  `,
})
export class Shell {
  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected readonly strings = STRINGS;
  protected readonly items = NAV_ITEMS;
  protected readonly profile = computed(() => ({
    name: this.profileService.user()?.name ?? '',
    route: '/settings',
  }));
  protected readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => pathOf(event.urlAfterRedirects)),
    ),
    { initialValue: pathOf(this.router.url) },
  );

  protected skipToContent(): void {
    this.main().nativeElement.focus();
  }
}
