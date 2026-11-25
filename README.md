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
  <a href="https://carfizzi.github.io/fizzy-ui/"><strong>Documentation</strong></a> ·
  <a href="https://carfizzi.github.io/fizzy-ui/components/accordion">Components</a> ·
  <a href="https://carfizzi.github.io/fizzy-ui/installation">Installation</a>
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
- **Ready for AI assistants.** [`llms.txt`](https://carfizzi.github.io/fizzy-ui/llms.txt) indexes every component, and each page is also served as Markdown (install command, usage, keyboard, accessibility).
- **Testable.** `npx fizzy-ui add select --harness` also copies an [Angular CDK test harness](https://material.angular.dev/cdk/test-harnesses/overview) for every interactive component, so your tests drive it like a user: `await (await loader.getHarness(FzSelectHarness)).clickOptions({ text: 'Kiwi' })`.
- **Works with your forms.** Every control binds with Signal Forms, Reactive Forms or `ngModel`, including value, disabled and touched state, with no ControlValueAccessor. Put it in `fzField` and the error is announced and marks the control `aria-invalid`.
- **Themeable.** Colors, radius, sizes and motion are CSS variables in one file, with dark mode built in. `npx fizzy-ui init --theme blue` sets a preset (neutral, blue, green, rose, violet, orange), and the [theme editor](https://carfizzi.github.io/fizzy-ui/theming) builds your own; every preset meets WCAG AA contrast, checked by the tests.
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

### Forms

```html
<div fzField>
  <label fzLabel>Room</label>
  <fz-select [formField]="booking.room">…</fz-select>   <!-- or [formControl], [(ngModel)] -->
  @if (booking.room().touched() && booking.room().invalid()) {
    <p fzFieldError>Pick a room.</p>
  }
</div>
```

See [Forms](https://carfizzi.github.io/fizzy-ui/forms) in the docs.

`npx fizzy-ui list` prints every name. Each component page in the [docs site](https://carfizzi.github.io/fizzy-ui/) shows a live example, its source, the keyboard interactions and the accessibility notes.

## CLI

| Command | |
|---|---|
| `fizzy-ui init` | Theme, Tailwind setup, imports in `styles.css` |
| `fizzy-ui add <names...>` | Copy components into your project and install their dependencies |
| `fizzy-ui diff [names...]` | Show what changed in the registry for the components you have |
| `fizzy-ui update [names...]` | Bring those changes in, keeping your edits (three-way merge) |
| `fizzy-ui list` | Print the available components |

| Option | |
|---|---|
| `--path <dir>` | Where the components live (default `src/app/ui`) |
| `--overwrite` | `add`: replace files that exist (by default they are kept); `update`: replace instead of merging |
| `--harness` | `add`: also copy the component's test harness (`<file>.harness.ts`) |
| `--theme <name>` | `init`: set a color preset in `src/fizzy.css` (neutral, blue, green, rose, violet, orange) |
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

Your copies never change by themselves. To take a newer version:

```sh
npx fizzy-ui@latest diff            # what changed in the registry, for the components you have
npx fizzy-ui@latest update          # bring it in and keep your edits
npx fizzy-ui@latest update select   # or only some
```

`update` is a three-way merge (with git) between your file, the registry's new version and the version you started from, which `add` and `update` keep in `.fizzy-ui/`: commit that folder. Where both sides changed the same lines, the file gets conflict markers to resolve. Files added before 22.4 have no base, so `update` leaves an edited one alone until you pass `--overwrite`. `npx fizzy-ui init --overwrite` replaces the theme.

## Versions

The major version is the Angular version the components are written for: fizzy-ui 22 is for Angular 22. Minor versions add components and features, patches fix bugs. On another Angular version, run the matching CLI (`npx fizzy-ui@22`); the CLI warns when they differ.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) to run the docs site and the tests, and to add a component.

## License

[MIT](LICENSE)
