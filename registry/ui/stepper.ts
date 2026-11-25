import { Component, ElementRef, afterNextRender, booleanAttribute, computed, contentChildren, inject, input, model, Injector } from '@angular/core';

let nextId = 0;

/**
 * Steps of a task: `<fz-stepper [(step)]="step" linear aria-label="Checkout" #s="fzStepper">` with
 * `<fz-step label="Shipping" [completed]="valid()">…</fz-step>`s; move with `s.next()` / `s.previous()`.
 * The headers are an ordered list of buttons, the current one `aria-current="step"`. With `linear`, a step
 * opens only once every step before it is `completed`. Other steps stay in the DOM (hidden), so forms
 * keep their values. `step` is the index, from 0.
 */
@Component({
  selector: 'fz-stepper',
  exportAs: 'fzStepper',
  host: {
    '[attr.aria-label]': 'null',
    '[attr.data-orientation]': 'orientation()',
    class: 'flex flex-col gap-6 data-[orientation=vertical]:flex-row',
  },
  template: `
    <ol
      [attr.aria-label]="ariaLabel()"
      class="flex items-center gap-2 text-sm in-data-[orientation=vertical]:flex-col in-data-[orientation=vertical]:items-start"
    >
      @for (s of steps(); track s; let i = $index, last = $last) {
        <li class="flex items-center gap-2 in-data-[orientation=vertical]:flex-col in-data-[orientation=vertical]:items-start" [class.flex-1]="!last">
          <button
            type="button"
            [id]="s.headerId"
            [attr.aria-current]="i === step() ? 'step' : null"
            [attr.aria-disabled]="!open(i) || null"
            class="group flex cursor-pointer items-center gap-2 rounded-md p-1 pe-2 font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=step]:text-foreground aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:text-muted-foreground"
            (click)="go(i)"
          >
            <span
              aria-hidden="true"
              class="flex size-7 shrink-0 items-center justify-center rounded-full border text-xs transition-colors group-aria-[current=step]:border-primary group-aria-[current=step]:bg-primary group-aria-[current=step]:text-primary-foreground"
              [class.bg-muted]="s.completed() && i !== step()"
            >
              {{ s.completed() && i !== step() ? '✓' : i + 1 }}
            </span>
            <span class="sr-only">Step {{ i + 1 }} of {{ steps().length }}: </span>
            <!-- on phones only the current step shows its label; the others keep it for screen readers -->
            <span class="max-sm:sr-only max-sm:group-aria-[current=step]:not-sr-only">{{ s.label() }}</span>
            @if (s.completed()) {
              <span class="sr-only">, completed</span>
            }
          </button>
          @if (!last) {
            <span aria-hidden="true" class="h-px min-w-4 flex-1 bg-border in-data-[orientation=vertical]:ms-4.5 in-data-[orientation=vertical]:h-4 in-data-[orientation=vertical]:w-px in-data-[orientation=vertical]:min-w-0 in-data-[orientation=vertical]:flex-none"></span>
          }
        </li>
      }
    </ol>
    <div class="min-w-0 flex-1"><ng-content /></div>
  `,
})
export class FzStepper {
  readonly step = model(0);
  readonly linear = input(false, { transform: booleanAttribute });
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly steps = contentChildren(FzStep);
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  /** In linear mode: the first step not completed; nothing past it opens. */
  private readonly reach = computed(() => {
    if (!this.linear()) return Infinity;
    const first = this.steps().findIndex((s) => !s.completed());
    return first < 0 ? Infinity : first;
  });

  open(index: number) {
    return index >= 0 && index < this.steps().length && index <= this.reach();
  }

  next() {
    this.go(this.step() + 1, true);
  }

  previous() {
    this.go(this.step() - 1, true);
  }

  /** `focus`: move focus to the new step's header (Next/Back buttons), so screen readers hear where they are. */
  go(index: number, focus = false) {
    if (!this.open(index)) return;
    this.step.set(index);
    if (focus) afterNextRender(() => this.el.querySelector<HTMLElement>(`#${this.steps()[index].headerId}`)?.focus(), { injector: this.injector });
  }
}

/** One step: its label, whether it is done, and its content (shown while it is the current step). */
@Component({
  selector: 'fz-step',
  host: {
    role: 'group',
    '[attr.aria-labelledby]': 'headerId',
    '[hidden]': 'stepper.step() !== stepper.steps().indexOf(this)',
    class: 'flex flex-col gap-4',
  },
  template: `<ng-content />`,
})
export class FzStep {
  readonly label = input.required<string>();
  readonly completed = input(false, { transform: booleanAttribute });
  readonly headerId = `fz-step-${nextId++}`;
  protected readonly stepper = inject(FzStepper);
}

export const FZ_STEPPER = [FzStepper, FzStep] as const;
