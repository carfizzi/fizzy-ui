import { Directive, computed, input } from '@angular/core';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50';

const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

const sizes = { default: 'h-9 px-4', sm: 'h-8 px-3', lg: 'h-10 px-6', icon: 'size-9' };

@Directive({
  selector: 'button[fzButton], a[fzButton]',
  host: { '[class]': 'classes()' },
})
export class FzButton {
  readonly variant = input<keyof typeof variants>('default');
  readonly size = input<keyof typeof sizes>('default');
  protected readonly classes = computed(() => `${base} ${variants[this.variant()]} ${sizes[this.size()]}`);
}

export const FZ_BUTTON = [FzButton] as const;
