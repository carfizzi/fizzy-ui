# fizzy-ui

shadcn-style Angular components built on `@angular/aria`. Angular Aria provides behavior and accessibility (keyboard, focus, ARIA). fizzy-ui adds the styling (Tailwind v4 + CSS variables) and a CLI that copies component source into the user's project, so the user owns the code. The starting reference was vercel-labs/ui. That project is a headless behavior layer, and for Angular `@angular/aria` already plays that role, so fizzy-ui follows the shadcn model on top of it.

The roadmap and test checklist are in `PLAN.md`. Update its checkboxes as work lands.

## Layout

- `registry/` is the source of truth.
  - `registry.json` maps each component name to its `files` and npm `dependencies`.
  - `ui/*.ts` holds the components.
  - `theme/fizzy.css` holds the tokens, with `.dark` for dark mode.
- `cli/index.mjs` is the `fizzy-ui` CLI (`init`, `add`, `list`). It has zero dependencies. `npm publish` from `cli/` bundles `registry/` through `prepack`.
- `src/` is the playground app. It imports straight from `../../registry/ui/*`. Tests live next to each component in `registry/ui/<name>.spec.ts` (picked up through `angular.json` test `include` and `tsconfig.spec.json`; `prepack` strips them from the npm package). `src/app/app.a11y.spec.ts` runs axe-core on the whole playground, so a new example is covered automatically.

## Component conventions

- Compose the Aria directive with `hostDirectives`, forward its inputs and outputs, and put Tailwind classes in `host.class`. See `registry/ui/tabs.ts`.
- Style state from the attributes Aria sets: `aria-selected:`, `aria-expanded:`, `aria-disabled:`, `data-[active=true]:`, and `[&[inert]]:hidden` for hidden panels.
- When a template ref is needed, for example the accordion trigger's `[panel]`, use a small component instead. Host directives don't expose `exportAs`. See `registry/ui/accordion.ts`.
- A file may import only `@angular/*`, because it gets copied as-is into user projects. Each file exports a `FZ_<NAME>` array for `imports`.
- Use only theme tokens (`bg-primary`, `text-muted-foreground`, `border`, `ring-ring`). No hardcoded colors.
- Popups (menu now; later select, combobox, popover, tooltip) follow `registry/ui/menu.ts`. The panel directive is the Aria directive through `hostDirectives`, so the user's items keep DI. An effect moves the panel element into a CDK overlay (`DomPortal`, native popover, `withPopoverLocation('inline')`) while Aria says it is visible. The panel `exportAs`es itself with a `.menu` field for `[fzMenuTrigger]` and `[submenu]`. `menubar` and `context-menu` live in `menu.ts` too (their registry entries point to the same file), because they share `FzMenu` and `FzMenuItem`.
- `select.ts` is the other popup shape. When the popup lives in the component's own template (items passed as data, `<fz-select-item>` read with `contentChildren`), use `cdkConnectedOverlay` there, as the Aria examples do. With `focusMode="activedescendant"`, the popup cancels `mousedown` so focus never leaves the trigger.
- A new component needs four things: the file in `registry/ui/`, an entry in `registry.json`, an example in `src/app/app.html`, and `registry/ui/<name>.spec.ts`.

## Commands

```sh
npm start                 # playground at http://localhost:4200
npm test                  # vitest, jsdom (ng test --watch=false)
npx ng build
node cli/index.mjs add tabs --registry <path-to>/registry   # run inside another Angular app
```

## Gotchas

- `ng add tailwind` installs an unrelated package. Tailwind is set up by hand: `tailwindcss`, `@tailwindcss/postcss`, and `.postcssrc.json`.
- Listbox `multi` with the default `selectionMode` (`follow`): a plain click replaces the selection and Ctrl+click adds. For checkbox-style toggling, use `selectionMode="explicit"`.
- Aria `softDisabled` is `true` by default: disabled items get focus from the keyboard (arrows, Home/End) but are never selected. Tests rely on this.
- A submenu must sit inside its parent menu in the DOM, otherwise Aria's focusout closes the parent. `inline` popovers do that in browsers. jsdom has no popover API, so `menu.spec.ts` stubs it. The submenu overlay attaches as soon as the parent menu is visible (hidden via `data-visible`), because Aria focuses into it synchronously on open.
- Aria sets its own `id` on menus and items, and open menus move in the DOM. In tests, find menus by a `data-*` attribute, not by `id` or document order.
- Bindings like `[fzMenuTrigger]="x"` are properties and are not in the DOM. In tests and scripts, select by ARIA (`button[aria-haspopup]`).
- Some Aria inputs have no boolean transform (`MenuItem.disabled`): use `[disabled]="true"`, not the bare attribute.
- Versions: Angular 22, `@angular/aria` 22.3, Node 24.
