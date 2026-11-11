import { Directive, ElementRef, effect, inject, input, output } from '@angular/core';

@Directive({
  selector: 'dialog[dtModal]',
  host: {
    tabindex: '-1',
    class: 'outline-none',
    '(cancel)': 'onCancel($event)',
    '(click)': 'onClick($event)',
  },
})
export class Modal {
  private readonly dialog = inject<ElementRef<HTMLDialogElement>>(ElementRef).nativeElement;

  readonly open = input.required<boolean>({ alias: 'dtModal' });

  readonly dismissRequested = output<void>();

  constructor() {
    effect(() => {
      if (this.open() && !this.dialog.open) {
        this.dialog.showModal();
        this.moveInitialFocus();
      } else if (!this.open() && this.dialog.open) {
        this.dialog.close();
      }
    });
  }

  private moveInitialFocus(): void {
    const target = this.dialog.querySelector<HTMLElement>('[data-dt-initial-focus]');
    (target ?? this.dialog).focus();
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    this.dismissRequested.emit();
  }

  protected onClick(event: MouseEvent): void {
    // Dialog content is wrapped in a padded child, so only the backdrop targets the dialog.
    if (event.target === this.dialog) this.dismissRequested.emit();
  }
}
