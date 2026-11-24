import { Directive } from '@angular/core';

/**
 * A bordered list of rows: `<ul fzListGroup>` + `<li fzListGroupItem>`, or a `<div fzListGroup>` of
 * `<a fzListGroupItem>` / `<button fzListGroupItem>` for rows you can act on (put links in a `nav`).
 * Mark the current row with `aria-current` (`page`, `true`…), a disabled button with `disabled`.
 */
@Directive({
  selector: '[fzListGroup]',
  host: { class: 'flex w-full flex-col divide-y overflow-hidden rounded-md border bg-background text-sm' },
})
export class FzListGroup {}

@Directive({
  selector: '[fzListGroupItem]',
  host: {
    class:
      'flex w-full items-center gap-3 px-4 py-3 text-left outline-none ' +
      // only links and buttons react to the pointer
      '[a&]:cursor-pointer [button&]:cursor-pointer [a&]:hover:bg-accent [button&]:hover:bg-accent [a&]:transition-colors [button&]:transition-colors ' +
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ' +
      'aria-[current]:bg-accent aria-[current]:font-medium aria-[current]:text-accent-foreground ' +
      'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
  },
})
export class FzListGroupItem {}

export const FZ_LIST_GROUP = [FzListGroup, FzListGroupItem] as const;
