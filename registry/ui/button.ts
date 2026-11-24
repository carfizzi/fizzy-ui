import { Directive, booleanAttribute, computed, input } from '@angular/core';

const base =
  'inline-flex h-(--fz-h) items-center justify-center gap-2 whitespace-nowrap rounded-md text-(length:--fz-text) font-medium transition-colors ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50';

const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

type FzSize = 'xs' | 'sm' | 'md' | 'lg';

@Directive({
  selector: 'button[fzButton], a[fzButton]',
  host: { '[class]': 'classes()', '[attr.data-size]': 'size() ?? null' },
})
export class FzButton {
  readonly variant = input<keyof typeof variants>('default');
  /** xs, sm, md, lg (the scale in fizzy.css). Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
  /** Square, for an icon-only button (give it an aria-label). */
  readonly icon = input(false, { transform: booleanAttribute });
  protected readonly classes = computed(() => `${base} ${variants[this.variant()]}${this.icon() ? ' w-(--fz-h)' : ' px-(--fz-px)'}`);
}

export const FZ_BUTTON = [FzButton] as const;
