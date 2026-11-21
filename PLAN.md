# fizzy-ui: component plan

Each component lives in `registry/ui/<name>.ts`, is listed in `registry/registry.json`, is shown in the playground, and has its own test in `registry/ui/<name>.spec.ts`.

## Done

- [x] **button**: styles only. Test: variants and sizes apply their classes, `disabled` works
- [x] **tabs** (`@angular/aria/tabs`). Test: click selects and updates `selectedTab`, panel `inert`, arrow keys, Home/End, disabled tab never selected
- [x] **accordion** (`@angular/aria/accordion`). Test: click opens and renders content, single vs `multiExpandable`, disabled item, arrows + Enter
- [x] **listbox** (`@angular/aria/listbox`). Test: single replaces, multi (explicit) toggles, multi (follow) Ctrl+click adds, arrows + Space, Home/End, typeahead, disabled option

## Phase 1: built on Angular Aria behaviors

- [x] **menu / dropdown-menu** (`@angular/aria/menu` + CDK overlay). Test: opens from the trigger, arrow keys, Enter selects and returns focus, Esc closes and returns focus, submenus (ArrowRight/Left), disabled item. Also checked in real headless Chrome: placement, submenu, outside click
- [x] **menubar** (`@angular/aria/menu`, MenuBar, in `menu.ts`). Test: menubar roles, click and ArrowDown open, ArrowLeft/Right along the bar even from an open menu, Escape returns focus, nested submenu + Enter. Checked in headless Chrome
- [x] **context-menu** (`@angular/aria/menu`, in `menu.ts`). Test: right click opens at the pointer (default prevented), a second right click moves it, Esc and Enter close and give focus back, no focus stealing. Checked in headless Chrome, context-menu key included
- [x] **select** (`@angular/aria/combobox` + listbox, `select.ts`). Test: closed combobox with placeholder, click/keyboard open, `aria-activedescendant`, Enter/click pick and close, focus stays on the select, Escape keeps the value, re-clicking the selected option keeps it, disabled option/select. Checked in headless Chrome. Typeahead not tested yet
- [x] **multiselect** (`@angular/aria/combobox` + listbox multi, in `select.ts`). Test: click/Space/Enter toggle and keep the list open, labels joined in the trigger, outside value reflected, disabled option ignored, Escape closes with focus kept. Checked in headless Chrome (Tab and outside click close)
- [x] **autocomplete / combobox** (`@angular/aria/combobox`, `combobox.ts`). Test: native label + role on the input, typing opens and filters (case-insensitive contains), `aria-activedescendant`, Enter/click write the option and keep focus, "No results" shown and announced, Escape. Checked in headless Chrome. Options are plain strings for now
- [ ] **toolbar** (`@angular/aria/toolbar`). Test: roving focus with arrow keys, toggle groups
- [ ] **tree** (`@angular/aria/tree`). Test: arrow keys expand and collapse, selection
- [ ] **grid / data-table** (`@angular/aria/grid`). Test: arrow keys move between cells, editable cells

## Phase 2: styles only (no Aria needed)

- [x] input
- [x] textarea
- [x] label
- [x] card
- [x] badge
- [x] separator
- [x] skeleton
- [x] avatar

Test for each: variants and the expected classes are applied. Separator also checks `role`/`aria-orientation`; avatar checks the fallback on image error.

## Phase 3: built on CDK or native HTML (not in Angular Aria)

- [ ] **dialog / sheet** (`@angular/cdk/dialog`). Test: focus trap, Esc closes, focus returns to the trigger
- [ ] **popover** (CDK overlay). Test: opens and closes, Esc, click outside
- [ ] **tooltip** (CDK overlay). Test: shows on hover and focus, `aria-describedby`
- [ ] **checkbox**. Test: `aria-checked`, indeterminate state, Space toggles
- [ ] **switch**. Test: `role="switch"`, `aria-checked`, Space toggles
- [ ] **radio-group**. Test: arrow keys move the selection, one value only
- [ ] **slider**. Test: arrow keys and Home/End change the value, `aria-valuenow`

## Phase 4: docs / showcase web app

An Angular site that documents and shows off the library, the way ui.shadcn.com does for shadcn.

Decision: **same repo**, by turning the playground (`src/`) into the docs app rather than adding a second repo. Reasons:
- Examples import `registry/ui/*` directly, so docs never drift from the code a user gets from `fizzy-ui add`.
- The axe check (`app.a11y.spec.ts`) keeps running on every example the docs show.
- One PR changes a component, its test and its docs together.
- shadcn/ui does the same: its docs site lives in the same monorepo as the registry.
Move it to its own repo only if it later needs its own release cycle or heavy dependencies (search, MDX pipeline).

- [ ] Routing: one page per component (`/components/<name>`), plus Introduction, Installation (`init`, `add`), Theming
- [ ] Component page: live demo(s), `npx fizzy-ui add <name>` command, usage snippet, keyboard table, accessibility notes
- [ ] "View source": show the registry file as text (esbuild `loader: 'text'` import attribute), so it is always the real file
- [ ] Copy-to-clipboard for commands and code, light/dark toggle, sidebar navigation
- [ ] Keep `app.a11y.spec.ts` green on every page (one axe run per route)
- [ ] Deploy: GitHub Pages needs a public repo (or a paid plan for private), otherwise Cloudflare Pages / Netlify / Vercel. Decide when the repo goes public

## Cross-cutting

- [x] Split the test: one spec per component in `registry/ui/<name>.spec.ts` (the playground spec is gone)
- [x] Automated accessibility check with axe-core on every playground example (`src/app/app.a11y.spec.ts`, initial state + opened panels; `color-contrast` off in jsdom)
- [ ] CLI tests: `init` and `add` on a fresh app, unknown names rejected, existing files not overwritten (checked by hand so far)
- [ ] Publish the CLI to npm (check that the `fizzy-ui` name is free first)
