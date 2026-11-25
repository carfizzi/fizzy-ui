# Tabs

> Panels of content, one visible at a time.

`npx fizzy-ui add tabs` copies `tabs.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_TABS } from './ui/tabs';

@Component({
  imports: [FZ_TABS],
  template: `
    <div fzTabs class="w-full max-w-md">
      <ul fzTabList [(selectedTab)]="tab">
        <li fzTab value="account">Account</li>
        <li fzTab value="password">Password</li>
        <li fzTab value="billing" disabled>Billing</li>
      </ul>
      <div fzTabPanel value="account"><ng-template ngTabContent>Make changes to your account here.</ng-template></div>
      <div fzTabPanel value="password"><ng-template ngTabContent>Change your password here.</ng-template></div>
      <div fzTabPanel value="billing"><ng-template ngTabContent>Billing.</ng-template></div>
    </div>
  `,
})
export class Demo {
  protected readonly tab = signal<string | undefined>('account');
}
```

## Keyboard

| Key | Action |
|---|---|
| ← / → | Move between tabs (selection follows) |
| Home / End | First or last tab |

## Accessibility

- One Tab stop for the tab list; Tab then moves into the panel.

## Testing

`npx fizzy-ui add tabs --harness` also copies `tabs.harness.ts`, an Angular CDK test harness: `FzTabsHarness` (methods documented in https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/testing/tabs.harness.ts).

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/tabs.ts (the file `add` copies; its doc comments describe the inputs)
