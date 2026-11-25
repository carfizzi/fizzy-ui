import { Component, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';

export interface FzTreeNode<V = unknown> {
  value: V;
  label: string;
  children?: FzTreeNode<V>[];
  disabled?: boolean;
  /** Initial state; Aria owns it afterwards. */
  expanded?: boolean;
}

/**
 * `<fz-tree [nodes]="data" [(value)]="selected" aria-label="…">`. The host is the Aria tree:
 * Up/Down move, Right expands or enters, Left collapses or goes to the parent, typeahead finds
 * by label. Click, Enter or Space select; `selectionMode="follow"` selects on focus, `multi` for several.
 * Children render only while their parent is expanded.
 */
@Component({
  selector: 'fz-tree',
  imports: [NgTemplateOutlet, TreeItem, TreeItemGroup],
  hostDirectives: [
    {
      directive: Tree,
      inputs: ['value', 'multi', 'disabled', 'selectionMode', 'softDisabled', 'wrap', 'typeaheadDelay'],
      outputs: ['valueChange'],
    },
  ],
  host: { class: 'flex flex-col gap-0.5 rounded-md border bg-background p-1 text-sm text-foreground outline-none' },
  template: `
    <ng-template #level let-nodes let-parent="parent">
      @for (node of nodes; track node.value) {
        <div
          ngTreeItem
          #item="ngTreeItem"
          [parent]="parent"
          [value]="node.value"
          [label]="node.label"
          [disabled]="!!node.disabled"
          [expanded]="!!node.expanded"
          [class]="css.item"
        >
          <div [class]="css.row" [style.padding-inline-start.rem]="(item.level() - 1) * 1.25 + 0.5">
            @if (node.children?.length) {
              <svg aria-hidden="true" viewBox="0 0 24 24" class="size-4 shrink-0 text-muted-foreground transition-transform" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6" /></svg>
            } @else {
              <span class="size-4 shrink-0"></span>
            }
            <span class="truncate">{{ node.label }}</span>
          </div>
          @if (node.children?.length) {
            <div role="group" class="flex flex-col gap-0.5 empty:hidden">
              <ng-template ngTreeItemGroup [ownedBy]="item" #group="ngTreeItemGroup">
                <ng-container *ngTemplateOutlet="level; context: { $implicit: node.children, parent: group }" />
              </ng-template>
            </div>
          }
        </div>
      }
    </ng-template>
    <ng-container *ngTemplateOutlet="level; context: { $implicit: nodes(), parent: tree }" />
  `,
})
export class FzTree<V = unknown> {
  readonly nodes = input.required<readonly FzTreeNode<V>[]>();
  protected readonly tree = inject(Tree);
  // The treeitem wraps its row and its children: state styles go on the row (first child) only.
  protected readonly css = {
    item:
      'flex flex-col gap-0.5 outline-none ' +
      '[&:focus-visible>:first-child]:ring-2 [&:focus-visible>:first-child]:ring-ring ' +
      '[&[aria-selected=true]>:first-child]:bg-accent [&[aria-selected=true]>:first-child]:font-medium ' +
      '[&[aria-expanded=true]>:first-child>svg]:rotate-90 [&[aria-disabled=true]>:first-child]:opacity-50',
    row: 'flex h-8 cursor-default select-none items-center gap-1.5 rounded-sm pe-2 hover:bg-accent/60',
  };
}

export const FZ_TREE = [FzTree] as const;
