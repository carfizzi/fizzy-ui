<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/.github/logo-dark.svg">
    <img src="https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/.github/logo-light.svg" width="96" height="96" alt="">
  </picture>
</p>

<h1 align="center">fizzy-ui</h1>

<p align="center">
  Accessible Angular components you copy into your project and own.<br>
  Built on <a href="https://angular.dev/guide/aria/overview"><code>@angular/aria</code></a>, styled with Tailwind v4.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fizzy-ui"><img src="https://img.shields.io/npm/v/fizzy-ui" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/fizzy-ui" alt="MIT license"></a>
</p>

```sh
npx fizzy-ui init
npx fizzy-ui add button dialog tabs
```

## Why fizzy-ui

- **Accessible by default.** Keyboard, focus and ARIA come from Angular Aria and the CDK, following the WAI-ARIA patterns. Every component has behavior tests, and every demo is checked with axe.
- **The code is yours.** Like [shadcn/ui](https://ui.shadcn.com), the CLI copies the source into your app. Nothing to upgrade at runtime and no wrapper to fight: change a component by editing its file.
- **Modern Angular.** Standalone components, signals, zoneless-ready. Two-way bindings with `[(value)]`.
- **Themeable.** Colors, radius, sizes and motion are CSS variables in one file, with dark mode built in.
- **Motion that feels native.** Spring animations in the style of Apple's guidelines, replaced by fades when the user asks for Reduce Motion.

## Requirements

- Angular 22 (the fizzy-ui version follows Angular: see [Versions](#versions))
- Tailwind CSS v4: `init` installs and configures it

## Getting started

**1. Initialize** once, in the project root:

```sh
npx fizzy-ui init
```

This writes the theme to `src/fizzy.css`, imports Tailwind and the theme in `src/styles.css`, creates `.postcssrc.json` and installs Tailwind.

**2. Add** the components you need:

```sh
npx fizzy-ui add button tabs
```

The files go to `src/app/ui/`. Missing dependencies (`@angular/aria`, `@angular/cdk`) are installed at your Angular version.

**3. Use** them:

```ts
import { Component, signal } from '@angular/core';
import { FZ_BUTTON } from './ui/button';
import { FZ_TABS } from './ui/tabs';

@Component({
  selector: 'app-root',
  imports: [FZ_BUTTON, FZ_TABS],
  template: `
    <div fzTabs>
      <ul fzTabList [(selectedTab)]="tab">
        <li fzTab value="account">Account</li>
        <li fzTab value="password">Password</li>
      </ul>
      <div fzTabPanel value="account"><ng-template ngTabContent>Your account.</ng-template></div>
      <div fzTabPanel value="password"><ng-template ngTabContent>Your password.</ng-template></div>
    </div>
    <button fzButton variant="outline">Save</button>
  `,
})
export class App {
  protected readonly tab = signal<string | undefined>('account');
}
```

## Components

| | |
|---|---|
| **Forms** | button, input, textarea, label, field, checkbox, switch, radio-group, slider, select, multiselect, combobox, chips, input-group, toggle, toggle-group, calendar, date-picker |
| **Overlays** | dialog, alert-dialog, sheet, popover, hover-card, tooltip, menu, context-menu, command, toast |
| **Navigation** | tabs, menubar, navigation-menu, sidebar, breadcrumb, pagination, stepper, toolbar |
| **Data** | table, grid, tree, listbox, list-group |
| **Layout and feedback** | accordion, collapsible, card, separator, skeleton, avatar, badge, alert, progress, spinner |

`npx fizzy-ui list` prints every name. Each component page in the docs site shows a live example, its source, the keyboard interactions and the accessibility notes.

## CLI

| Command | |
|---|---|
| `fizzy-ui init` | Theme, Tailwind setup, imports in `styles.css` |
| `fizzy-ui add <names...>` | Copy components into your project and install their dependencies |
| `fizzy-ui list` | Print the available components |

| Option | |
|---|---|
| `--path <dir>` | Where `add` writes files (default `src/app/ui`) |
| `--overwrite` | Replace files that already exist (by default they are kept) |
| `--skip-install` | Do not install npm dependencies |
| `--registry <dir\|url>` | Read components from another registry |

## Customizing

- **One component, everywhere:** edit its file in `src/app/ui/`.
- **One use:** add classes on the element; they join the component's own. To override something the component already sets, add `!`: `<fz-select class="w-56!">`.
- **Theme:** edit the variables in `src/fizzy.css` (colors, radius, motion durations). Dark mode: put the `dark` class on `<html>`.
- **Sizes:** controls come in `xs`, `sm`, `md` (default) and `lg`. Set `size` on one, or `data-size` on any container to size everything inside it:

  ```html
  <form data-size="sm">…</form>
  ```

## Updating

Your copies never change by themselves. To take a newer version of a component, run `npx fizzy-ui add <name> --overwrite` and review the diff in git: your own edits to that file are replaced. `npx fizzy-ui init --overwrite` does the same for the theme.

## Versions

The major version is the Angular version the components are written for: fizzy-ui 22 is for Angular 22. Minor versions add components and features, patches fix bugs. On another Angular version, run the matching CLI (`npx fizzy-ui@22`); the CLI warns when they differ.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) to run the docs site and the tests, and to add a component.

## License

[MIT](LICENSE)
