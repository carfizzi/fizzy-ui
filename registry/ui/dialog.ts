import { DOCUMENT, Directive, ElementRef, Injector, TemplateRef, ViewContainerRef, afterNextRender, inject, input } from '@angular/core';
import { InputModalityDetector } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { PositionStrategy, createGlobalPositionStrategy } from '@angular/cdk/overlay';

type Side = 'center' | 'left' | 'right' | 'top' | 'bottom';

// Classes go on the overlay pane; the CDK container inside it lays out the user's content.
// `!` where CDK styles the same property: its CSS is unlayered and beats Tailwind's layered utilities
// (`.cdk-overlay-pane { max-width: 100% }`, `.cdk-dialog-container { display: block }`).
const CONTENT = 'bg-background text-foreground shadow-lg [&>.cdk-dialog-container]:flex! [&>.cdk-dialog-container]:flex-col [&>.cdk-dialog-container]:gap-4 [&>.cdk-dialog-container]:outline-none';
// A dialog fades and grows slightly, a sheet slides in from its edge, and they leave the same way
// (data-closing). Keyframes in fizzy.css; fades under Reduce Motion.
const PANEL: Record<Side, string> = {
  center: `${CONTENT} w-[calc(100vw-2rem)] max-w-lg! rounded-lg border p-6 animate-fz-dialog data-closing:animate-fz-dialog-out data-closing:pointer-events-none!`,
  right: `${CONTENT} w-3/4 max-w-sm! border-l p-6 animate-fz-sheet-right data-closing:animate-fz-sheet-right-out data-closing:pointer-events-none!`,
  left: `${CONTENT} w-3/4 max-w-sm! border-r p-6 animate-fz-sheet-left data-closing:animate-fz-sheet-left-out data-closing:pointer-events-none!`,
  top: `${CONTENT} border-b p-6 animate-fz-sheet-top data-closing:animate-fz-sheet-top-out data-closing:pointer-events-none!`,
  bottom: `${CONTENT} border-t p-6 animate-fz-sheet-bottom data-closing:animate-fz-sheet-bottom-out data-closing:pointer-events-none!`,
};
let nextId = 0;

/**
 * Modal dialog, or a sheet with `side="right"` (left, top, bottom):
 * `<ng-template fzDialog #dlg="fzDialog">` holding an `<h2 fzDialogTitle>` (required: it names
 * the dialog), content, and `<button fzDialogClose>`. Open with `dlg.open()`. The CDK traps focus,
 * closes on Escape and backdrop click, and gives focus back to the opener. Every close plays the
 * exit animation first (ignoring clicks meanwhile), so `closed` emits once it has ended.
 * `role="alertdialog"` asks for a decision: a backdrop click does not close it (Escape still does);
 * add `fzDialogDescription` and put `cdkFocusInitial` on the least destructive button.
 */
@Directive({ selector: 'ng-template[fzDialog]', exportAs: 'fzDialog' })
export class FzDialog<R = unknown> {
  readonly side = input<Side>('center');
  readonly role = input<'dialog' | 'alertdialog'>('dialog');
  readonly titleId = `fz-dialog-title-${nextId++}`;
  private readonly dialog = inject(Dialog);
  private readonly template = inject(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly modality = inject(InputModalityDetector);
  private ref?: DialogRef<R>;

  open(): DialogRef<R> {
    const side = this.side();
    const alert = this.role() === 'alertdialog';
    let state: 'open' | 'leaving' | 'closed' = 'open';
    const ref = (this.ref = this.dialog.open<R>(this.template, {
      viewContainerRef: this.viewContainerRef,
      ariaLabelledBy: this.titleId,
      role: this.role(),
      disableClose: alert, // no backdrop close; Escape is handled below
      panelClass: PANEL[side].split(' '),
      backdropClass: ['bg-background/80', 'backdrop-blur-sm'],
      maxWidth: '', // CDK defaults to an inline 80vw, which would beat the max-w-* classes
      positionStrategy: this.position(side),
      height: side === 'left' || side === 'right' ? '100%' : undefined,
      width: side === 'top' || side === 'bottom' ? '100%' : undefined,
      // Escape, backdrop, fzDialogClose and close() all ask here: the first ask plays the exit animation,
      // later ones wait for it, then the dialog closes for real with the first result.
      closePredicate: (result: unknown) => {
        if (state !== 'open') return state === 'closed';
        if (this.document.hidden) return true; // background tab: animations don't run, close now
        const origin = this.modality.mostRecentModality ?? 'program'; // the deferred close loses CDK's
        const leaving = this.leave(ref);
        if (!leaving.length) return true; // motion off, or no animation support (tests)
        state = 'leaving';
        Promise.allSettled(leaving.map((a) => a.finished)).then(() => {
          state = 'closed';
          ref.close(result as R | undefined, { focusOrigin: origin });
        });
        return false;
      },
    }));
    if (alert)
      ref.keydownEvents.subscribe((event) => {
        if (event.key !== 'Escape' || hasModifierKey(event)) return;
        event.preventDefault();
        ref.close();
      });
    return ref;
  }

  close(result?: R) {
    this.ref?.close(result);
  }

  /** Starts the exit animation and returns what is running. */
  private leave(ref: DialogRef<R>): Animation[] {
    const pane = ref.overlayRef.overlayElement;
    // Clicks are ignored (pointer-events-none) but focus stays inside: inert would drop it to the
    // aria-hidden page, where a Tab could leave it and the CDK would no longer give it back.
    pane.dataset['closing'] = '';
    ref.overlayRef.backdropElement?.classList.remove('cdk-overlay-backdrop-showing'); // fade it out alongside
    return pane.getAnimations?.() ?? [];
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

/** Describes the dialog (`aria-describedby`): the message of an alert dialog. */
@Directive({ selector: '[fzDialogDescription]', host: { '[id]': 'id', class: 'text-sm text-muted-foreground' } })
export class FzDialogDescription {
  protected readonly id = `fz-dialog-description-${nextId++}`;

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    // Set on the CDK container once rendered: an aria-describedby must not point at a missing id.
    afterNextRender(() => el.closest('[role=dialog],[role=alertdialog]')?.setAttribute('aria-describedby', this.id));
  }
}

/** Closes the dialog it is in: `<button fzButton fzDialogClose>` or `[fzDialogClose]="result"`. */
@Directive({ selector: '[fzDialogClose]', host: { '(click)': 'ref.close(fzDialogClose())' } })
export class FzDialogClose {
  readonly fzDialogClose = input<unknown>();
  protected readonly ref = inject(DialogRef);
}

export const FZ_DIALOG = [FzDialog, FzDialogTitle, FzDialogDescription, FzDialogClose] as const;
