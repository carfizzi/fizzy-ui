import { Directive, ElementRef, inject, input, model } from '@angular/core';
import { Toolbar, ToolbarWidget, ToolbarWidgetGroup } from '@angular/aria/toolbar';

/**
 * `<div fzToolbar aria-label="…">` with `<button fzToolbarItem>` children. One Tab stop; arrows,
 * Home and End move between items. Use `fzSeparator orientation="vertical"` between groups.
 */
@Directive({
  selector: '[fzToolbar]',
  hostDirectives: [{ directive: Toolbar, inputs: ['orientation', 'softDisabled', 'disabled', 'wrap'] }],
  host: {
    class:
      'flex w-fit items-center gap-1 rounded-md border bg-background p-1 text-sm ' +
      'aria-[orientation=vertical]:flex-col aria-disabled:opacity-50',
  },
})
export class FzToolbar {}

/**
 * Single-choice toggle group: `<div fzToolbarGroup [(value)]="align" aria-label="…">` with
 * `<button fzToolbarItem value="left">`. A radiogroup: Up/Down move inside it in a horizontal toolbar.
 */
@Directive({
  selector: '[fzToolbarGroup]',
  hostDirectives: [{ directive: ToolbarWidgetGroup, inputs: ['disabled'] }],
  host: { role: 'radiogroup', class: 'flex items-center gap-1 in-[[aria-orientation=vertical]]:flex-col' },
})
export class FzToolbarGroup<V = unknown> {
  readonly value = model<V>();
}

/**
 * A toolbar button. Inside `fzToolbarGroup` it is a radio for its `value`; elsewhere, bind
 * `[(pressed)]` to make it a toggle (`aria-pressed`), or leave it out for a plain action.
 */
@Directive({
  selector: '[fzToolbarItem]',
  hostDirectives: [{ directive: ToolbarWidget, inputs: ['id', 'disabled'] }],
  host: {
    '[attr.role]': 'group ? "radio" : null',
    '[attr.aria-checked]': 'group ? group.value() === value() : null',
    '[attr.aria-pressed]': 'group ? null : pressed()',
    '(click)': 'toggle()',
    class:
      'inline-flex h-8 min-w-8 cursor-default select-none items-center justify-center gap-2 rounded-sm px-2 font-medium outline-none ' +
      'hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring ' +
      'aria-pressed:bg-accent aria-pressed:text-accent-foreground aria-checked:bg-accent aria-checked:text-accent-foreground ' +
      'aria-disabled:pointer-events-none aria-disabled:opacity-50',
  },
})
export class FzToolbarItem<V = unknown> {
  readonly value = input<V>();
  readonly pressed = model<boolean>();
  protected readonly group = inject<FzToolbarGroup<V>>(FzToolbarGroup, { optional: true });
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;

  protected toggle() {
    // Soft-disabled items stay focusable and get Space/Enter clicks: ignore them (own, group or toolbar).
    if (this.el.closest('[aria-disabled=true]')) return;
    if (this.group) this.group.value.set(this.value());
    else if (this.pressed() !== undefined) this.pressed.update((p) => !p);
  }
}

export const FZ_TOOLBAR = [FzToolbar, FzToolbarGroup, FzToolbarItem] as const;
