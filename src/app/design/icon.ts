import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import add_circle from '@material-symbols/svg-400/rounded/add_circle-fill.svg';
import ac_unit from '@material-symbols/svg-400/rounded/ac_unit-fill.svg';
import arrow_back from '@material-symbols/svg-400/rounded/arrow_back.svg';
import arrow_left from '@material-symbols/svg-400/outlined/arrow_left.svg';
import arrow_right from '@material-symbols/svg-400/outlined/arrow_right.svg';
import check from '@material-symbols/svg-400/rounded/check.svg';
import close from '@material-symbols/svg-400/rounded/close-fill.svg';
import cloud from '@material-symbols/svg-400/rounded/cloud-fill.svg';
import delete_icon from '@material-symbols/svg-400/rounded/delete-fill.svg';
import error from '@material-symbols/svg-400/outlined/error.svg';
import home from '@material-symbols/svg-400/rounded/home-fill.svg';
import lightbulb from '@material-symbols/svg-400/outlined/lightbulb.svg';
import local_fire_department from '@material-symbols/svg-400/outlined/local_fire_department.svg';
import location_on from '@material-symbols/svg-400/outlined/location_on.svg';
import notifications_active from '@material-symbols/svg-400/outlined/notifications_active.svg';
import partly_cloudy_day from '@material-symbols/svg-400/rounded/partly_cloudy_day-fill.svg';
import settings from '@material-symbols/svg-400/rounded/settings-fill.svg';
import task from '@material-symbols/svg-400/rounded/task-fill.svg';
import thunderstorm from '@material-symbols/svg-400/rounded/thunderstorm-fill.svg';
import umbrella from '@material-symbols/svg-400/rounded/umbrella-fill.svg';
import wb_sunny from '@material-symbols/svg-400/rounded/wb_sunny-fill.svg';

/** Per-icon imports keep only these glyphs in the bundle, not a multi-MB icon font. */
const ICONS = {
  ac_unit,
  add_circle,
  arrow_back,
  arrow_left,
  arrow_right,
  check,
  close,
  cloud,
  delete: delete_icon,
  error,
  home,
  lightbulb,
  local_fire_department,
  location_on,
  notifications_active,
  settings,
  task,
  thunderstorm,
  umbrella,
  wb_sunny,
  // Material Symbols no longer ships wb_cloudy; this is its closest successor.
  wb_cloudy: partly_cloudy_day,
} as const;

export type IconName = keyof typeof ICONS;

/** Decorative Material Symbol: the accessible name belongs to the parent control. */
@Component({
  selector: 'dt-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: {
    'aria-hidden': 'true',
    class: 'inline-flex shrink-0 [&>svg]:size-full [&>svg]:fill-current',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[innerHTML]': 'svg()',
  },
})
export class Icon {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<IconName>();
  readonly size = input(24);

  // Safe to trust: the markup comes from the package at build time, never from users.
  protected readonly svg = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(ICONS[this.name()]),
  );
}
