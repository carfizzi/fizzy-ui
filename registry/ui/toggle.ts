import { Directive, ElementRef, booleanAttribute, computed, inject, input, model } from '@angular/core';
import { Toolbar, ToolbarWidget } from '@angular/aria/toolbar';

const base =
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-muted hover:text-muted-foreground ' +
  'aria-pressed:bg-accent aria-pressed:text-accent-foreground ' +
  'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';
const variants = { default: 'bg-transparent', outline: 'border bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground' };
const sizes = { default: 'h-9 min-w-9 px-2', sm: 'h-8 min-w-8 px-1.5', lg: 'h-10 min-w-10 px-2.5' };
type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

/** An on/off button: `<button fzToggle [(pressed)]="bold" aria-label="Bold">`. A native button with `aria-pressed`. */
@Directive({
  selector: 'button[fzToggle]',
  host: { type: 'button', '[attr.aria-pressed]': 'pressed()', '(click)': 'pressed.set(!pressed())', '[class]': 'classes()' },
})
export class FzToggle {
  readonly pressed = model(false);
  readonly variant = input<Variant>('default');
  readonly size = input<Size>('default');
  protected readonly classes = computed(() => `${base} ${variants[this.variant()]} ${sizes[this.size()]}`);
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
  host: { class: 'inline-flex w-fit items-center gap-1 aria-[orientation=vertical]:flex-col' },
})
export class FzToggleGroup<V = unknown> {
  readonly value = model<V | V[] | undefined>();
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly variant = input<Variant>('default');
  readonly size = input<Size>('default');

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
  protected readonly classes = computed(() => `${base} ${variants[this.group.variant()]} ${sizes[this.group.size()]}`);

  protected toggle() {
    // Soft-disabled items stay focusable and get Space/Enter clicks: ignore them (own or group).
    if (!this.el.closest('[aria-disabled=true]')) this.group.toggle(this.value());
  }
}

export const FZ_TOGGLE = [FzToggle] as const;
export const FZ_TOGGLE_GROUP = [FzToggleGroup, FzToggleGroupItem] as const;
