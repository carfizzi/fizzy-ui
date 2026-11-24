# fizzy-ui

shadcn-style Angular components built on `@angular/aria`. Angular Aria provides behavior and accessibility (keyboard, focus, ARIA). fizzy-ui adds the styling (Tailwind v4 + CSS variables) and a CLI that copies component source into the user's project, so the user owns the code. The starting reference was vercel-labs/ui. That project is a headless behavior layer, and for Angular `@angular/aria` already plays that role, so fizzy-ui follows the shadcn model on top of it.

The roadmap and test checklist are in `PLAN.md`. Update its checkboxes as work lands.

## Layout

- `registry/` is the source of truth.
  - `registry.json` maps each component name to its `files` and npm `dependencies`.
  - `ui/*.ts` holds the components.
  - `theme/fizzy.css` holds the tokens, with `.dark` for dark mode.
- `cli/index.mjs` is the `fizzy-ui` CLI (`init`, `add`, `list`). It has zero dependencies. `npm publish` from `cli/` bundles `registry/` through `prepack`. Its version follows Angular's major (`22.x.y` for Angular 22; minor for components and features, patch for fixes), and `add` installs `@angular/*` dependencies at the project's `@angular/core` major. `README.md` is for users (npm shows it too, so image links are absolute); development notes go in `CONTRIBUTING.md`.
- `src/` is the docs site (formerly the playground). `src/app/docs.ts` lists one entry per registry item (title, keyboard table, a11y notes, lazy loaders); `src/app/demos/<name>.ts` is its live example, also shown as the usage code; `src/app/pages/` holds the guides and the component page. Demos import straight from `../../../registry/ui/*`. Tests live next to each component in `registry/ui/<name>.spec.ts` (picked up through `angular.json` test `include` and `tsconfig.spec.json`; `prepack` strips them from the npm package). `src/app/app.a11y.spec.ts` runs axe-core on every route and demo, and fails if a registry item has no docs entry.

## Component conventions

- Compose the Aria directive with `hostDirectives`, forward its inputs and outputs, and put Tailwind classes in `host.class`. See `registry/ui/tabs.ts`.
- Style state from the attributes Aria sets: `aria-selected:`, `aria-expanded:`, `aria-disabled:`, `data-[active=true]:`, and `[&[inert]]:hidden` for hidden panels.
- When a template ref is needed, for example the accordion trigger's `[panel]`, use a small component instead. Host directives don't expose `exportAs`. See `registry/ui/accordion.ts`.
- A file may import only `@angular/*`, because it gets copied as-is into user projects. Each file exports a `FZ_<NAME>` array for `imports`.
- Use only theme tokens (`bg-primary`, `text-muted-foreground`, `border`, `ring-ring`). No hardcoded colors.
- Sizes: one scale in `fizzy.css` (`[data-size=xs|sm|md|lg]` set `--fz-h`, `--fz-px`, `--fz-field-px`, `--fz-text`, plus `--fz-avatar`, `--fz-spinner`, `--fz-badge-text`); `md` is `:root`. A sized component has an optional `size = input<FzSize>()` bound to `[attr.data-size]` (unset: it inherits from the nearest container) and classes that read the tokens (`h-(--fz-h)`, `px-(--fz-field-px)`, `text-(length:--fz-text)`), never a per-size class map. Each file declares its own `FzSize` type (files are copied alone). On an `<input>` host, also bind `[attr.size]: null` (the native attribute). Never set the same property from two classes (padding vs icon width): pick one in the computed class.
- Popups (menu now; later select, combobox, popover, tooltip) follow `registry/ui/menu.ts`. The panel directive is the Aria directive through `hostDirectives`, so the user's items keep DI. An effect moves the panel element into a CDK overlay (`DomPortal`, native popover, `withPopoverLocation('inline')`) while Aria says it is visible. The panel `exportAs`es itself with a `.menu` field for `[fzMenuTrigger]` and `[submenu]`. `menubar` and `context-menu` live in `menu.ts` too (their registry entries point to the same file), because they share `FzMenu` and `FzMenuItem`. Likewise `toggle` and `toggle-group` share `toggle.ts` (the group is an Aria `Toolbar` of `aria-pressed` buttons).
- `select.ts` is the other popup shape. When the popup lives in the component's own template (items passed as data, `<fz-select-item>` read with `contentChildren`), use `cdkConnectedOverlay` there, as the Aria examples do. With `focusMode="activedescendant"`, the popup cancels `mousedown` so focus never leaves the trigger.
- `combobox.ts` is the third shape. The trigger is the user's own `<input>`, so labels and attributes stay native. An `<input>` can't host a template, so the directive creates its popup component as a sibling with `ViewContainerRef.createComponent` and passes itself in.
- `dialog.ts` opens an `ng-template` through the CDK `Dialog` service (focus trap, Escape, backdrop, focus restore, `aria-hidden` on the rest). `bare` drops the panel look (the content draws it, as `fz-command` in the docs search) and `align="top"` anchors a centered dialog at 12vh so its top stays still when its height changes. `role="alertdialog"` (also the `alert-dialog` registry entry) sets `disableClose` and handles Escape itself; initial focus is CDK's `cdkFocusInitial` attribute, which jsdom cannot check (no layout: the CDK focuses the container). `popover.ts` (and `hover-card.ts`) copy the FzMenu overlay pattern; `tooltip.ts` keeps its element next to the trigger while hidden so `aria-describedby` always resolves.
- Motion follows Apple's HIG: springs (`--fz-spring`, `ease-spring`) and the durations in `fizzy.css`. Enter animations are theme keyframes (`animate-fz-popup`, `animate-fz-dialog`, `animate-fz-sheet-*`, `animate-fz-tooltip`), whose Reduce Motion versions are fades. State changes (accordion height, switch thumb, checkbox mark, chevrons, `fz-command` results height) are transitions with `ease-spring`; a height that follows content (`auto`) is animated by setting it in px from a `ResizeObserver` (see `command.ts`), since `auto` does not transition everywhere; under Reduce Motion they fade or are instant (gate the whole transition with `motion-safe:`, duration included, or the default `transition-property: all` still animates). The tab highlight is one `aria-hidden` span that `FzTabList` appends and moves to the selected tab, sliding only after its first placement (`data-ready`). Frequent interactions (submenus, menubar, tree) stay instant. Dialog exit: `closePredicate` sets `data-closing` (exit keyframes, `forwards`, `pointer-events-none`), waits for `getAnimations()`, then closes with the input modality as focus origin; a hidden tab closes at once. Never make the dialog pane inert or move focus out early: focus would land on the `aria-hidden` page and the CDK would not give it back. Popup exit: the `leave()` helper (copied into each popup file) marks `data-closing` + `inert`, detaches when `getAnimations()` end, and returns a cancel for a reopen; select and combobox keep `cdkConnectedOverlayOpen` true while leaving (`closingPopup()`, Aria `preserveContent`). Hide rules must yield to `data-closing` (`data-[open=false]:not-data-closing:hidden`); never force a display while closing (`data-closing:block!` overrode a user's `flex` mid-fade).
- `toast.ts` is a root service (`FzToaster.show()`), no markup: the first toast attaches a region component in a global CDK overlay. Announcements go through the CDK `LiveAnnouncer` (the region itself is not live, so nothing is read twice). Toasts leave with Angular's `animate.leave`, not `leave()`: they are `@for` items.
- `chips.ts` renders its listbox in its own template from `<fz-chip>` data, like select: a host directive's input default can't be changed, and Aria's `selectionMode` defaults to `follow`. Its `aria-label` is an input moved onto the inner listbox (and nulled on the host).
- `field.ts` wires through the DOM after every render (like `slider.ts`): it finds the first control, label, `fzFieldDescription` and `fzFieldError` inside it, so it works with any control and with `@if`'d errors. It only removes the `aria-invalid` it set itself.
- `navigation-menu.ts` is the APG disclosure navigation pattern (buttons + panels of plain links), not Aria's menubar: menu roles are for app menus. `sidebar.ts` makes its phone drawer modal by setting `inert` on every element beside the path from the drawer up to `<body>` (and undoing exactly those), instead of a focus trap.
- `calendar.ts` (calendar + date-picker) is the APG date grid with its own roving tabindex, not Aria's grid: arrows and PageUp/Down cross months. Dates are local days at midnight. `fzField` names a popup button (`button[aria-haspopup]`) with `aria-labelledby="label button"` so the value stays in the name; no `label[for]` (a click would press it).
- Form controls (checkbox, switch, radio-group, slider) are styled native inputs, not Aria: keep it that way so forms and labels keep working.
- A new component needs four things: the file in `registry/ui/`, an entry in `registry.json`, a demo in `src/app/demos/<name>.ts` plus its entry in `src/app/docs.ts`, and `registry/ui/<name>.spec.ts`.

## Commands

```sh
npm start                 # docs site at http://localhost:4200
npm test                  # vitest, jsdom (ng test --watch=false)
npm run test:cli          # CLI tests (node:test), each in a temp project
npm run release [minor|patch]   # bump cli/package.json, test, commit, tag, push (CI publishes); -- --dry-run to preview
npx ng build
node cli/index.mjs add tabs --registry <path-to>/registry   # run inside another Angular app
```

After every change run `npm test`; when `cli/` or `registry/registry.json` changed, also `npm run test:cli`. Run `npx ng build` before committing. Never commit with a red test or build.

## Gotchas

- `animate.leave="cls"` waits for the element's longest computed animation: if an enter animation class (`animate-fz-*`) still wins over `cls` in the CSS, Angular waits for an `animationend` that never comes. Give the leave class `!`.
- `ng add tailwind` installs an unrelated package. Tailwind is set up by hand: `tailwindcss`, `@tailwindcss/postcss`, and `.postcssrc.json`.
- Listbox `multi` with the default `selectionMode` (`follow`): a plain click replaces the selection and Ctrl+click adds. For checkbox-style toggling, use `selectionMode="explicit"`.
- Aria `softDisabled` is `true` by default: disabled items get focus from the keyboard (arrows, Home/End) but are never selected. Tests rely on this.
- A submenu must sit inside its parent menu in the DOM, otherwise Aria's focusout closes the parent. `inline` popovers do that in browsers. jsdom has no popover API, so `menu.spec.ts` stubs it. The submenu overlay attaches as soon as the parent menu is visible (hidden via `data-visible`), because Aria focuses into it synchronously on open.
- Aria sets its own `id` on menus and items, and open menus move in the DOM. In tests, find menus by a `data-*` attribute, not by `id` or document order.
- Bindings like `[fzMenuTrigger]="x"` are properties and are not in the DOM. In tests and scripts, select by ARIA (`button[aria-haspopup]`).
- Some Aria inputs have no boolean transform (`MenuItem.disabled`, `GridCell.disabled`): use `[disabled]="true"`, not the bare attribute.
- Tree `selectionMode` defaults to `explicit` (listbox and grid default to `follow`).
- A grid cell that holds a `ngGridCellWidget` never takes focus itself: the widget does. Enter only switches the widget between navigation and editing (`data-active-control`).
- Roving widgets (menubar, grid) keep one item `data-active` at rest: tie the highlight to focus (`focus-within`, `focus-visible`), not to `data-active` alone.
- CDK's own CSS is unlayered, so it beats Tailwind utilities (which live in `@layer`) on the same property: use `!` there (`max-w-lg!` on an overlay pane, `flex!` on `.cdk-dialog-container`). CDK also sets an inline `maxWidth: 80vw` on dialogs unless `maxWidth: ''`.
- `@starting-style` does not work on CDK overlay panes: CDK shows the pane before adding `panelClass`, and Chrome computes its style in between. Use keyframe animations for enter.
- A user class joins a component's host classes; it does not replace them. When both set the same property, Tailwind's CSS order decides (numbers before keywords: `w-full` beats `w-56`). There is no tailwind-merge here: overrides use `!` (`class="w-56!"`), as the docs say (Installation → Customizing) and the demos do.
- Tailwind finds classes by scanning source text: never build class names at runtime (no `'[&::x]:' + y`).
- In CDP scripts, `rawKeyDown` Enter does not click a native `<button>`: send `keyDown` with `text: '\r'`.
- Source shown on the docs comes from `import('…', { with: { loader: 'text' } })` (Angular's import attribute). TypeScript still types it as the module: read `.default` through a cast. Never use a template-literal import path: esbuild then bundles the whole folder, specs included.
- Destroying an overlay's DOM (`document.body.innerHTML = ''`) mid-test breaks later CDK overlays in the same test: one opened popup per test.
- Aria `MenuItem.searchTerm` defaults to '', which disables typeahead: `FzMenuItem` falls back to its text.
- Aria's keyboard managers `stopPropagation` every key they handle, even when the handler does nothing (Escape on an `alwaysExpanded` combobox): a dialog or popover around it never sees it. `command.ts` forwards Escape from its host; the CDK dialog reads `keyCode`, so the forwarded event defines `keyCode: 27`.
- Angular drops whitespace-only text nodes: a space between an `sr-only` span and the next element disappears from the accessible name ("Step 2 of 3:Payment"). Put the space inside the text.
- Fake timers: turn them on after the first `whenStable()` and flush with `TestBed.tick()`; with them on earlier, Angular's scheduler never runs and `whenStable()` hangs. jsdom's `:focus-visible` after `focus()` differs by element (a link matched): mock `matches` both ways.
- `resource.value()` throws in the error state: check `hasValue()` first.
- `<base href="/">` makes `href="#x"` mean `/#x`: in-page links (the skip link) need a click handler. The site is deployed under `/fizzy-ui/` (GitHub Pages): links in demos are relative (`href="introduction"`), never root-absolute (`/introduction`).
- Versions: Angular 22, `@angular/aria` 22.3, Node 24.
