import { Directive, computed, input } from '@angular/core';

const variants = {
  default: 'bg-background text-foreground',
  destructive: 'border-destructive bg-background text-destructive [&_[data-fz=alert-description]]:text-destructive/90',
};

/**
 * A callout: `<div fzAlert>` with an optional leading `<svg>`, `fzAlertTitle` and `fzAlertDescription`.
 * `role="alert"` by default, which screen readers announce at once when it appears. For a message
 * that is on the page from the start, use `role="status"`, or `[role]="null"` for none.
 */
@Directive({
  selector: '[fzAlert]',
  host: { '[attr.role]': 'role()', '[class]': 'classes()' },
})
export class FzAlert {
  readonly variant = input<keyof typeof variants>('default');
  readonly role = input<'alert' | 'status' | null>('alert');
  protected readonly classes = computed(
    () =>
      'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm ' +
      'has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current ' +
      variants[this.variant()],
  );
}

@Directive({ selector: '[fzAlertTitle]', host: { class: 'col-start-2 font-medium tracking-tight' } })
export class FzAlertTitle {}

@Directive({
  selector: '[fzAlertDescription]',
  host: { 'data-fz': 'alert-description', class: 'col-start-2 grid gap-1 text-muted-foreground [&_p]:leading-relaxed' },
})
export class FzAlertDescription {}

export const FZ_ALERT = [FzAlert, FzAlertTitle, FzAlertDescription] as const;
