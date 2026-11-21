import { Directive, computed, input } from '@angular/core';

const base =
  'inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-ring';

const variants = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  outline: 'text-foreground',
  destructive: 'border-transparent bg-destructive text-destructive-foreground',
};

@Directive({
  selector: '[fzBadge]',
  host: { '[class]': 'classes()' },
})
export class FzBadge {
  readonly variant = input<keyof typeof variants>('default');
  protected readonly classes = computed(() => `${base} ${variants[this.variant()]}`);
}

export const FZ_BADGE = [FzBadge] as const;
