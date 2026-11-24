import { Directive, ElementRef, booleanAttribute, computed, inject, input, model } from '@angular/core';
import { Toolbar, ToolbarWidget } from '@angular/aria/toolbar';

const base =
  'inline-flex h-(--fz-h) min-w-(--fz-h) cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md px-[calc(var(--fz-px)/2)] text-(length:--fz-text) font-medium transition-colors ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-muted hover:text-muted-foreground ' +
  'aria-pressed:bg-accent aria-pressed:text-accent-foreground ' +
  'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';
const variants = { default: 'bg-transparent', outline: 'border bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground' };
type Variant = keyof typeof variants;
type FzSize = 'xs' | 'sm' | 'md' | 'lg';

/** An on/off button: `<button fzToggle [(pressed)]="bold" aria-label="Bold">`. A native button with `aria-pressed`. */
@Directive({
  selector: 'button[fzToggle]',
  host: { type: 'button', '[attr.aria-pressed]': 'pressed()', '(click)': 'pressed.set(!pressed())', '[class]': 'classes()', '[attr.data-size]': 'size() ?? null' },
})
export class FzToggle {
  readonly pressed = model(false);
  readonly variant = input<Variant>('default');
  /** xs, sm, md, lg. Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
  protected readonly classes = computed(() => `${base} ${variants[this.variant()]}`);
}

/**
 * A set of toggles with one Tab stop (arrows, Home, End move between them):
 * `<div fzToggleGroup [(value)]="align" aria-label="Alignment">` + `<button fzToggleGroupItem value="left">`.
 * One value at a time (pressing it again clears it), or `multiple` for an array of values.
 * Every item is an `aria-pressed` button in both modes.
 */
@Directive({
  selector: '[fzToggleGroup]',
  hostDirectives: [{ directive: Toolbar, inputs: ['orientation', 'disabled'] }],
  host: { class: 'inline-flex w-fit items-center gap-1 aria-[orientation=vertical]:flex-col', '[attr.data-size]': 'size() ?? null' },
})
export class FzToggleGroup<V = unknown> {
  readonly value = model<V | V[] | undefined>();
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly variant = input<Variant>('default');
  /** Sizes every item (they inherit it through data-size). */
  readonly size = input<FzSize>();

  isPressed(v: V) {
    const value = this.value();
    return this.multiple() ? Array.isArray(value) && value.includes(v) : value === v;
  }

  toggle(v: V) {
    if (!this.multiple()) return this.value.set(this.isPressed(v) ? undefined : v);
    const list = Array.isArray(this.value()) ? (this.value() as V[]) : [];
    this.value.set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }
}

@Directive({
  selector: '[fzToggleGroupItem]',
  hostDirectives: [{ directive: ToolbarWidget, inputs: ['id', 'disabled'] }],
  host: { '[attr.aria-pressed]': 'group.isPressed(value())', '(click)': 'toggle()', '[class]': 'classes()' },
})
export class FzToggleGroupItem<V = unknown> {
  readonly value = input.required<V>();
  protected readonly group = inject<FzToggleGroup<V>>(FzToggleGroup);
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly classes = computed(() => `${base} ${variants[this.group.variant()]}`);

  protected toggle() {
    // Soft-disabled items stay focusable and get Space/Enter clicks: ignore them (own or group).
    if (!this.el.closest('[aria-disabled=true]')) this.group.toggle(this.value());
  }
}

export const FZ_TOGGLE = [FzToggle] as const;
export const FZ_TOGGLE_GROUP = [FzToggleGroup, FzToggleGroupItem] as const;
