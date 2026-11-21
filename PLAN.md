# fizzy-ui: component plan

Each component lives in `registry/ui/<name>.ts`, is listed in `registry/registry.json`, has a docs page (`src/app/demos/<name>.ts` + an entry in `src/app/docs.ts`), and has its own test in `registry/ui/<name>.spec.ts`.

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
- [x] **toolbar** (`@angular/aria/toolbar`, `toolbar.ts`). Test: toolbar/radiogroup/radio/`aria-pressed` roles, one Tab stop, arrows + Home/End with wrap, Up/Down inside a group, `[(pressed)]` toggles, `fzToolbarGroup [(value)]` single choice, disabled item ignored. Checked in headless Chrome
- [x] **tree** (`@angular/aria/tree`, `tree.ts`, data-driven `[nodes]`). Test: tree/group/level roles, collapsed children not rendered, Right/Left expand, enter, parent, collapse, explicit (default) vs follow selection, click toggles, multi + Space, outside value. Checked in headless Chrome (typeahead too)
- [x] **grid / data-table** (`@angular/aria/grid`, `grid.ts`, on the user's `<table>`). Test: grid/row/columnheader roles, one Tab stop, arrows (looping) + Home/End + Ctrl+Home/End, Space selects with `[(selected)]`, disabled cell never selected, editable cell (Enter or typing edits, arrows stay in the input, Enter/Escape stop). Checked in headless Chrome. No sorting/pagination yet

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

Form controls are styled native inputs: browsers already give them roles, keyboard, labels and forms support (`ngModel`, reactive and signal forms), so there is no Aria directive to compose.

- [x] **dialog / sheet** (`@angular/cdk/dialog`, `dialog.ts`, `side` for sheets). Test: named by `fzDialogTitle`, rest of the page `aria-hidden`, focus inside + trap anchors, Esc closes and focus returns, `fzDialogClose` result, right sheet full height. Checked in headless Chrome (Tab stays inside, backdrop click, light/dark)
- [x] **popover** (CDK overlay, `popover.ts`, the FzMenu pattern). Test: dialog role wired to the trigger, opens with focus on the first field, Esc closes and gives focus back, trigger toggles, click outside and focus leaving close it. Checked in headless Chrome
- [x] **tooltip** (CDK overlay, `tooltip.ts`). Test: `aria-describedby` (kept alongside existing ones), hover after 500ms, short hover never shows, hoverable (pointer onto the tooltip), Escape, keyboard focus at once but not mouse focus. Checked in headless Chrome
- [x] **checkbox** (styled native input). Test: label click, `ngModel`, native `indeterminate` cleared by a click, disabled. Space checked in headless Chrome
- [x] **switch** (native checkbox + `role="switch"`). Test: role, checked state, label click. Space checked in headless Chrome
- [x] **radio-group** (`radiogroup` around native radios). Test: role, one value only (label and radio clicks). Arrow keys checked in headless Chrome
- [x] **slider** (styled native range). Test: `--fz-fill` follows input events and bindings. Arrows, Home/End, Page Up checked in headless Chrome

## Phase 4: docs / showcase web app

An Angular site that documents and shows off the library, the way ui.shadcn.com does for shadcn.

Decision: **same repo**, by turning the playground (`src/`) into the docs app rather than adding a second repo. Reasons:
- Examples import `registry/ui/*` directly, so docs never drift from the code a user gets from `fizzy-ui add`.
- The axe check (`app.a11y.spec.ts`) keeps running on every example the docs show.
- One PR changes a component, its test and its docs together.
- shadcn/ui does the same: its docs site lives in the same monorepo as the registry.
Move it to its own repo only if it later needs its own release cycle or heavy dependencies (search, MDX pipeline).

- [x] Routing: one page per component (`/components/<name>`, data in `src/app/docs.ts`), plus Introduction, Installation (`init`, `add`), Theming
- [x] Component page: live demo, `npx fizzy-ui add <name>` command, usage snippet (the demo file itself, imports rewritten to `./ui/`), keyboard table, accessibility notes
- [x] "View source": show the registry file as text (esbuild `loader: 'text'` import attribute), so it is always the real file
- [x] Copy-to-clipboard for commands and code, light/dark toggle (remembered, no flash), sidebar navigation (a left sheet on mobile), skip link
- [x] Keep `app.a11y.spec.ts` green on every page (one axe run per route, plus opened popups; a test fails if a registry item has no page)
- [ ] Deploy: GitHub Pages needs a public repo (or a paid plan for private), otherwise Cloudflare Pages / Netlify / Vercel. Decide when the repo goes public

## Cross-cutting

- [x] Split the test: one spec per component in `registry/ui/<name>.spec.ts` (the playground spec is gone)
- [x] Automated accessibility check with axe-core on every docs page and example (`src/app/app.a11y.spec.ts`, initial state + opened panels; `color-contrast` off in jsdom)
- [ ] CLI tests: `init` and `add` on a fresh app, unknown names rejected, existing files not overwritten (checked by hand so far)
- [ ] Publish the CLI to npm (check that the `fizzy-ui` name is free first)
- [ ] Animations and transitions, Apple style (HIG Motion, WWDC23 "Animate with springs"): springs as CSS `linear()`, durations as tokens in `fizzy.css` (0s turns motion off), Reduce Motion swaps scale/slide for fades
  - [x] A: enter animations (dialog, sheet, popover, menu, select, combobox, tooltip), accordion height, switch spring. Checked in Chrome: spring curve, origin from the trigger side, submenus instant, fades only under Reduce Motion
  - [x] B: exit animations for dialog and sheet (CDK `closePredicate`: the first close plays the exit, later ones wait, then it closes with the first result; panel inert meanwhile, backdrop fades alongside, CDK gives focus back at the end). Checked in Chrome: Escape, backdrop, fzDialogClose, double Escape, reopen during exit, mobile nav, Reduce Motion
  - [ ] C: exit animations for popover, menu, select, combobox, tooltip (mark the panel closing and inert, detach after the animation; instant in jsdom)
