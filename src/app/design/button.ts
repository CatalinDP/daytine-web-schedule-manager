import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ButtonVariant = 'filled' | 'text' | 'tonal';
export type ButtonTone = 'primary' | 'error' | 'tertiary' | 'inherit';

// The ::after layer grows the 40px visual height to a 44px touch target.
const BASE =
  'relative inline-flex min-h-10 items-center justify-center gap-2 rounded-full py-2 text-center ' +
  'text-label-large transition-colors duration-200 after:absolute after:inset-x-0 ' +
  'after:-inset-y-0.5 disabled:cursor-not-allowed';

const FILLED =
  'px-6 bg-primary text-on-primary enabled:hover:bg-primary/90 ' +
  'disabled:bg-on-surface/10 disabled:text-on-surface/40';

const TONAL =
  'px-6 bg-on-primary-container text-on-primary enabled:hover:bg-on-primary-container/90 ' +
  'disabled:bg-on-surface/10 disabled:text-on-surface/40';

const TEXT: Record<ButtonTone, string> = {
  primary: 'px-3 text-primary hover:bg-primary/10 disabled:text-on-surface/40',
  error: 'px-3 text-error hover:bg-error/10 disabled:text-on-surface/40',
  tertiary: 'px-3 text-tertiary hover:bg-tertiary/10 disabled:text-on-surface/40',
  inherit: 'px-3 hover:bg-current/10 disabled:opacity-40',
};

@Component({
  selector: 'button[dt-button], a[dt-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: { '[class]': 'classes()' },
})
export class Button {
  readonly variant = input<ButtonVariant>('filled');
  readonly tone = input<ButtonTone>('primary');

  protected readonly classes = computed(() => {
    const variant = this.variant();
    if (variant === 'filled') return `${BASE} ${FILLED}`;
    if (variant === 'tonal') return `${BASE} ${TONAL}`;
    return `${BASE} ${TEXT[this.tone()]}`;
  });
}

/** Round icon-only button. Always give it an `aria-label`. */
@Component({
  selector: 'button[dt-icon-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class:
      'inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors ' +
      'duration-200 enabled:hover:bg-current/10 disabled:opacity-40',
  },
})
export class IconButton {}
