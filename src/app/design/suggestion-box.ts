import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Button, IconButton } from './button';
import { Icon, IconName } from './icon';

export type SuggestionBoxVariant = 'default' | 'error';

@Component({
  selector: 'dt-suggestion-box',
  imports: [Button, Icon, IconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex items-center gap-3 rounded-sm px-4 py-2',
    '[class]':
      "variant() === 'error' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'",
  },
  template: `
    <dt-icon [name]="icon()" />

    <div class="flex min-w-0 flex-1 flex-col">
      <p class="text-title-medium lg:text-title-small">{{ title() }}</p>
      @if (label(); as label) {
        <p class="text-label-large">{{ label }}</p>
      }
    </div>

    @if (actionLabel(); as actionLabel) {
      <button dt-button type="button" variant="text" tone="inherit" (click)="action.emit()">
        {{ actionLabel }}
      </button>
    }
    @if (closeLabel(); as closeLabel) {
      <button dt-icon-button type="button" [attr.aria-label]="closeLabel" (click)="dismiss.emit()">
        <dt-icon name="close" [size]="20" />
      </button>
    }
  `,
})
export class SuggestionBox {
  readonly icon = input.required<IconName>();
  readonly title = input.required<string>();
  readonly label = input<string>();
  readonly actionLabel = input<string>();
  readonly closeLabel = input<string>();
  readonly variant = input<SuggestionBoxVariant>('default');

  readonly action = output<void>();
  readonly dismiss = output<void>();
}
