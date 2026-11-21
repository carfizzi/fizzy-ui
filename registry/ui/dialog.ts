import { Directive, Injector, TemplateRef, ViewContainerRef, inject, input } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { PositionStrategy, createGlobalPositionStrategy } from '@angular/cdk/overlay';

type Side = 'center' | 'left' | 'right' | 'top' | 'bottom';

// Classes go on the overlay pane; the CDK container inside it lays out the user's content.
// `!` where CDK styles the same property: its CSS is unlayered and beats Tailwind's layered utilities
// (`.cdk-overlay-pane { max-width: 100% }`, `.cdk-dialog-container { display: block }`).
const CONTENT = 'bg-background text-foreground shadow-lg [&>.cdk-dialog-container]:flex! [&>.cdk-dialog-container]:flex-col [&>.cdk-dialog-container]:gap-4 [&>.cdk-dialog-container]:outline-none';
// Enter: a dialog fades and grows slightly, a sheet slides in from its edge (fizzy.css; fades under Reduce Motion).
const PANEL: Record<Side, string> = {
  center: `${CONTENT} w-[calc(100vw-2rem)] max-w-lg! rounded-lg border p-6 animate-fz-dialog`,
  right: `${CONTENT} w-3/4 max-w-sm! border-l p-6 animate-fz-sheet-right`,
  left: `${CONTENT} w-3/4 max-w-sm! border-r p-6 animate-fz-sheet-left`,
  top: `${CONTENT} border-b p-6 animate-fz-sheet-top`,
  bottom: `${CONTENT} border-t p-6 animate-fz-sheet-bottom`,
};
let nextId = 0;

/**
 * Modal dialog, or a sheet with `side="right"` (left, top, bottom):
 * `<ng-template fzDialog #dlg="fzDialog">` holding an `<h2 fzDialogTitle>` (required: it names
 * the dialog), content, and `<button fzDialogClose>`. Open with `dlg.open()`. The CDK traps focus,
 * closes on Escape and backdrop click, and gives focus back to the opener.
 */
@Directive({ selector: 'ng-template[fzDialog]', exportAs: 'fzDialog' })
export class FzDialog<R = unknown> {
  readonly side = input<Side>('center');
  readonly titleId = `fz-dialog-title-${nextId++}`;
  private readonly dialog = inject(Dialog);
  private readonly template = inject(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private ref?: DialogRef<R>;

  open(): DialogRef<R> {
    const side = this.side();
    this.ref = this.dialog.open<R>(this.template, {
      viewContainerRef: this.viewContainerRef,
      ariaLabelledBy: this.titleId,
      panelClass: PANEL[side].split(' '),
      backdropClass: ['bg-background/80', 'backdrop-blur-sm'],
      maxWidth: '', // CDK defaults to an inline 80vw, which would beat the max-w-* classes
      positionStrategy: this.position(side),
      height: side === 'left' || side === 'right' ? '100%' : undefined,
      width: side === 'top' || side === 'bottom' ? '100%' : undefined,
    });
    return this.ref;
  }

  close(result?: R) {
    this.ref?.close(result);
  }

  private position(side: Side): PositionStrategy | undefined {
    const global = createGlobalPositionStrategy(this.injector);
    if (side === 'center') return undefined; // CDK default: centered
    if (side === 'left') return global.left('0').top('0');
    if (side === 'right') return global.right('0').top('0');
    return side === 'top' ? global.top('0').left('0') : global.bottom('0').left('0');
  }
}

@Directive({
  selector: '[fzDialogTitle]',
  host: { '[id]': 'dialog.titleId', class: 'text-lg font-semibold leading-none' },
})
export class FzDialogTitle {
  protected readonly dialog = inject(FzDialog);
}

/** Closes the dialog it is in: `<button fzButton fzDialogClose>` or `[fzDialogClose]="result"`. */
@Directive({ selector: '[fzDialogClose]', host: { '(click)': 'ref.close(fzDialogClose())' } })
export class FzDialogClose {
  readonly fzDialogClose = input<unknown>();
  protected readonly ref = inject(DialogRef);
}

export const FZ_DIALOG = [FzDialog, FzDialogTitle, FzDialogClose] as const;
