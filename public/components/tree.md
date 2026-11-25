# Tree

> A hierarchical list that expands and collapses.

`npx fizzy-ui add tree` copies `tree.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_TREE, FzTreeNode } from './ui/tree';

@Component({
  imports: [FZ_TREE],
  template: `
    <div class="flex flex-col gap-2">
      <fz-tree [nodes]="files" [(value)]="file" aria-label="Project files" class="w-64" />
      <p class="text-sm text-muted-foreground">Value: {{ file().join(', ') || '—' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly file = signal<string[]>([]);
  protected readonly files: FzTreeNode<string>[] = [
    {
      value: 'src',
      label: 'src',
      expanded: true,
      children: [
        { value: 'src/app', label: 'app', children: [{ value: 'src/app/app.ts', label: 'app.ts' }, { value: 'src/app/app.html', label: 'app.html' }] },
        { value: 'src/main.ts', label: 'main.ts' },
      ],
    },
    { value: 'registry', label: 'registry', children: [{ value: 'registry/registry.json', label: 'registry.json' }] },
    { value: 'secrets', label: 'secrets (locked)', disabled: true },
    { value: 'package.json', label: 'package.json' },
  ];
}
```

## Keyboard

| Key | Action |
|---|---|
| ↓ / ↑ | Move through visible items |
| → | Expand, or move to the first child |
| ← | Collapse, or move to the parent |
| Enter / Space | Select |
| Type | Jump to an item by label |

## Accessibility

- Give the tree an aria-label.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/tree.ts (the file `add` copies; its doc comments describe the inputs)
