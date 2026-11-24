import { Component, ElementRef, booleanAttribute, computed, input, model, numberAttribute, output, signal, viewChild } from '@angular/core';

type FzSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * A one-time code: `<fz-input-otp [(value)]="code" (complete)="verify($event)" aria-label="Verification code" />`,
 * or inside `fzField` with a label. One real `<input>` (transparent, over the boxes), so pasting
 * "123 456", SMS autofill (`autocomplete="one-time-code"`), the numeric keyboard and screen readers all
 * work as in any text field; the boxes are only a drawing of it. Characters that don't fit the
 * `pattern` are dropped.
 */
@Component({
  selector: 'fz-input-otp',
  host: {
    '[attr.aria-label]': 'null',
    '[attr.data-size]': 'size() ?? null',
    class: 'group/otp relative inline-flex w-fit has-disabled:opacity-50',
  },
  template: `
    <div class="flex gap-2" aria-hidden="true">
      @for (char of slots(); track $index) {
        <div
          [attr.data-active]="active($index) || null"
          class="relative flex size-(--fz-h) items-center justify-center rounded-md border bg-background text-(length:--fz-text) font-medium shadow-xs transition-shadow data-active:ring-2 data-active:ring-ring group-has-[input[aria-invalid=true]]/otp:border-destructive"
        >
          {{ char }}
          @if (caret() === $index) {
            <span class="absolute h-1/2 w-px bg-foreground motion-safe:animate-pulse"></span>
          }
        </div>
      }
    </div>
    <input
      #field
      [attr.id]="inputId() ?? null"
      [attr.aria-label]="ariaLabel() ?? null"
      [value]="value()"
      [disabled]="disabled()"
      autocomplete="one-time-code"
      [attr.inputmode]="pattern() === 'digits' ? 'numeric' : 'text'"
      [attr.pattern]="pattern() === 'digits' ? '[0-9]*' : null"
      spellcheck="false"
      autocapitalize="off"
      class="absolute inset-0 size-full cursor-text bg-transparent text-transparent caret-transparent outline-none selection:bg-transparent disabled:cursor-not-allowed"
      (input)="onInput()"
      (focus)="focused.set(true); sync()"
      (blur)="focused.set(false)"
      (pointerup)="toEnd()"
      (selectionchange)="sync()"
      (keyup)="sync()"
      (select)="sync()"
    />
  `,
})
export class FzInputOtp {
  readonly value = model('');
  readonly length = input(6, { transform: numberAttribute });
  /** `digits` (default) or `alphanumeric` (letters and digits). */
  readonly pattern = input<'digits' | 'alphanumeric'>('digits');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** xs, sm, md, lg. Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
  /** Id of the inner input, for a `<label for>` outside `fzField`. */
  readonly inputId = input<string>();
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** Emits the code once every box is filled. */
  readonly complete = output<string>();

  protected readonly focused = signal(false);
  private readonly selection = signal<[number, number]>([0, 0]);
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  protected readonly slots = computed(() => Array.from({ length: this.length() }, (_, i) => this.value()[i] ?? ''));
  /** The box with the blinking caret: the next one to fill, while focused and nothing is selected. */
  protected readonly caret = computed(() => {
    const [start, end] = this.selection();
    return this.focused() && start === end && start === this.value().length && start < this.length() ? start : -1;
  });

  protected active(i: number) {
    if (!this.focused()) return false;
    const [start, end] = this.selection();
    return start === end ? i === Math.min(start, this.length() - 1) : i >= start && i < end;
  }

  protected onInput() {
    const field = this.field().nativeElement;
    const clean = field.value.replace(this.pattern() === 'digits' ? /\D/g : /[^\da-z]/gi, '').slice(0, this.length());
    if (clean !== field.value) field.value = clean;
    this.value.set(clean);
    this.sync();
    if (clean.length === this.length()) this.complete.emit(clean);
  }

  // A click lands on a box, not on the (invisible) text: put the caret where typing continues.
  protected toEnd() {
    const field = this.field().nativeElement;
    if (field.selectionStart !== field.selectionEnd) return;
    field.setSelectionRange(field.value.length, field.value.length);
    this.sync();
  }

  protected sync() {
    const field = this.field().nativeElement;
    this.selection.set([field.selectionStart ?? 0, field.selectionEnd ?? 0]);
  }
}

export const FZ_INPUT_OTP = [FzInputOtp] as const;
