import { Directive } from '@angular/core';
import { Grid, GridCell, GridCellWidget, GridRow } from '@angular/aria/grid';

/**
 * Data grid on your own table: `<table fzGrid aria-label="…">` → `<tr fzGridRow>` →
 * `<th fzGridCell role="columnheader">` / `<td fzGridCell>`. One Tab stop; arrows, Home/End and
 * Ctrl+Home/End move between cells. `enableSelection` (+ `multi`) selects cells (`[(selected)]`).
 */
@Directive({
  selector: 'table[fzGrid]',
  hostDirectives: [
    {
      directive: Grid,
      inputs: ['enableSelection', 'disabled', 'softDisabled', 'focusMode', 'rowWrap', 'colWrap', 'multi', 'selectionMode'],
    },
  ],
  host: { class: 'group/grid w-full border-collapse rounded-md text-sm text-foreground outline-none' },
})
export class FzGrid {}

@Directive({
  selector: 'tr[fzGridRow]',
  hostDirectives: [{ directive: GridRow, inputs: ['rowIndex'] }],
  host: { class: 'border-b' },
})
export class FzGridRow {}

/** `disabled` has no boolean transform in Aria: write `[disabled]="true"`. */
@Directive({
  selector: '[fzGridCell]',
  hostDirectives: [
    {
      directive: GridCell,
      inputs: ['role', 'rowSpan', 'colSpan', 'rowIndex', 'colIndex', 'disabled', 'selected', 'selectable'],
      outputs: ['selectedChange'],
    },
  ],
  host: {
    class:
      'h-10 px-2 text-start align-middle outline-none ' +
      // Aria keeps one cell active even at rest: show it only while focus is in the grid.
      'group-focus-within/grid:data-[active=true]:ring-2 group-focus-within/grid:data-[active=true]:ring-inset group-focus-within/grid:data-[active=true]:ring-ring ' +
      '[&[role=columnheader]]:font-medium [&[role=columnheader]]:text-muted-foreground ' +
      'aria-selected:bg-accent aria-selected:text-accent-foreground aria-disabled:opacity-50',
  },
})
export class FzGridCell {}

/**
 * Editable cell content: `<td fzGridCell><input fzGridCellInput widgetType="editable" aria-label="…"></td>`.
 * The input takes the cell's focus. Enter or typing starts editing (arrows move the caret, not the
 * grid); Enter or Escape stops.
 * Use `widgetType="simple"` for a button (Enter/Space click it).
 */
@Directive({
  selector: '[fzGridCellInput]',
  hostDirectives: [
    { directive: GridCellWidget, inputs: ['widgetType', 'disabled', 'focusTarget'], outputs: ['activated', 'deactivated'] },
  ],
  host: {
    class:
      '-ms-1 h-8 w-full rounded-sm bg-transparent px-1 outline-none ' +
      // the cell ring shows where focus is; this one says "editing"
      'data-[active-control=widget]:ring-2 data-[active-control=widget]:ring-ring',
  },
})
export class FzGridCellInput {}

export const FZ_GRID = [FzGrid, FzGridRow, FzGridCell, FzGridCellInput] as const;
