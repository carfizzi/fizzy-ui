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
- [x] **select** (`@angular/aria/combobox` + listbox, `select.ts`). Test: closed combobox with placeholder, click/keyboard open, `aria-activedescendant`, Enter/click pick and close, focus stays on the select, Escape keeps the value, re-clicking the selected option keeps it, disabled option/select. Checked in headless Chrome, typeahead
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
- [ ] Component search (like ui.shadcn.com): a button in the header plus ⌘K / Ctrl+K opens a dialog that filters components and guides by title and description (data from `src/app/docs.ts`, no search service), arrows + Enter navigate to the page. Build it with the `command` component from phase 5 so the docs use their own component (until then, `combobox.ts` in a `dialog.ts`). Add the open dialog to `app.a11y.spec.ts`
- [ ] Deploy: GitHub Pages needs a public repo (or a paid plan for private), otherwise Cloudflare Pages / Netlify / Vercel. Decide when the repo goes public

## Cross-cutting

- [x] Split the test: one spec per component in `registry/ui/<name>.spec.ts` (the playground spec is gone)
- [x] Automated accessibility check with axe-core on every docs page and example (`src/app/app.a11y.spec.ts`, initial state + opened panels; `color-contrast` off in jsdom)
- [x] CLI tests (`cli/index.test.mjs`, `npm run test:cli`): `list`, usage, project root check, `add` (several, `--path`), unknown names rejected, existing files kept unless `--overwrite`, a registry cannot write outside `--path`, `init` idempotent, registry from a URL. Package install is not tested (always `--skip-install`)
- [ ] Publish the CLI to npm (check that the `fizzy-ui` name is free first)
- [x] Animations and transitions, Apple style (HIG Motion, WWDC23 "Animate with springs"): springs as CSS `linear()`, durations as tokens in `fizzy.css` (0s turns motion off), Reduce Motion swaps scale/slide for fades
  - [x] A: enter animations (dialog, sheet, popover, menu, select, combobox, tooltip), accordion height, switch spring. Checked in Chrome: spring curve, origin from the trigger side, submenus instant, fades only under Reduce Motion
  - [x] B: exit animations for dialog and sheet (CDK `closePredicate`: the first close plays the exit, later ones wait, then it closes with the first result; clicks ignored and focus kept inside meanwhile, backdrop fades alongside, CDK gives focus back at the end with the right focus origin; a background tab closes at once). Checked in Chrome: Escape, backdrop, fzDialogClose, double Escape, reopen during exit, mobile nav, Reduce Motion
  - [x] C: exit animations for popover, menu, select, combobox, tooltip: a 150ms fade (`leave()`: data-closing + inert, detach when the animation ends, cancel on reopen; select/combobox keep the overlay open meanwhile with Aria `preserveContent`). Focus returns at once. Checked in Chrome: no flash, reopen while fading, Reduce Motion
- [x] Checkbox animation: the check mark (and indeterminate bar) springs in, a fade under Reduce Motion. Checked in Chrome
- [x] Tabs: the active-tab indicator slides to the new tab instead of jumping (one indicator element positioned from the selected tab, `ease-spring`; instant under Reduce Motion). Checked in Chrome, both tab lists of the docs page

## Phase 5: more components (from shadcn, Angular Material, Bootstrap)

In priority order. Each one needs the usual four pieces (file, `registry.json`, demo + docs entry, spec).

- [x] **toast** (shadcn sonner, Material snackbar, Bootstrap toasts): `FzToaster.show()`, a region in a global CDK overlay (bottom right, full width on phones), announced with the CDK `LiveAnnouncer` (polite, assertive for `destructive`), optional action ("Undo"), timers paused on hover and focus, Alt+T to reach it, Escape dismisses, focus goes back, at most 3, exit with `animate.leave`. Checked in Chrome (desktop, phone, enter/exit, clicks through the empty region)
- [x] **alert** (shadcn, Bootstrap): `role` input (`alert` default, `status`, none), variants (default, destructive), title, description, leading icon. No built-in close button: put an `fzButton` in it
- [x] **progress** (all three): styled native `<progress>`, value springs; indeterminate when there is no value (a sweeping bar, a pulse under Reduce Motion). Checked in Chrome
- [x] **spinner** (Material progress-spinner, Bootstrap, shadcn): `<fz-spinner>`, `role="status"` with a hidden label, pulses under Reduce Motion
- [x] **toggle** and **toggle-group** (shadcn, Material button-toggle, both in `toggle.ts`): `button[fzToggle] [(pressed)]`; the group is an Aria toolbar (one Tab stop, arrows) of `aria-pressed` items, single (pressing again clears) or `multiple` (array)
- [x] **alert-dialog** (shadcn): `dialog.ts` with `role="alertdialog"`: no backdrop close (Escape still cancels), `fzDialogDescription` → `aria-describedby` (plain dialogs too), first focus via `cdkFocusInitial` on Cancel. Checked in Chrome
- [x] **collapsible** (shadcn, Bootstrap collapse, Material expansion panel): a disclosure (`aria-expanded`, `aria-controls`, inert content) with the accordion's height transition; no Aria directive needed. Checked in Chrome
- [ ] **chips** (Material): a chip listbox to pick from options (Aria listbox) and a chip input for free tags (remove with Backspace / a button)
- [x] **field** (shadcn field, Material form-field): `<div fzField>` wires label (`for`, or `aria-labelledby` for non-inputs like `fz-select`), `fzFieldDescription`, `fzFieldError` (`role="alert"`) with `aria-describedby` / `aria-invalid`, keeping the user's own ids; `orientation="horizontal"`. Checked in Chrome
- [ ] **input-group** (shadcn, Bootstrap) and floating label (Bootstrap): prefix/suffix text or buttons, styles only
- [ ] **table** (shadcn, Bootstrap): styled `<table>`, sort headers with `aria-sort` (Material sort header). Sorting also for `grid.ts`
- [ ] **pagination** (shadcn, Bootstrap, Material paginator): `nav` with `aria-current="page"`, page-size select
- [ ] **breadcrumb** (shadcn, Bootstrap): `nav` + `ol`, `aria-current="page"` on the last item
- [ ] **list-group** (Bootstrap list group, Material list): static or actionable lists of items
- [ ] **stepper** (Material): horizontal / vertical steps on Aria tabs, linear mode
- [ ] **command** (shadcn): combobox + listbox filter in a dialog (⌘K palette)
- [ ] **hover-card** (shadcn): the popover opened on hover, tooltip delays
- [ ] **navigation-menu** (shadcn) and navbar (Bootstrap): Aria menubar pattern with link panels, responsive
- [ ] **sidebar** (shadcn, Material sidenav): collapsible app sidebar, a sheet on mobile (the docs nav already does this)
- [ ] **drawer** (shadcn): bottom sheet with drag to close; skip unless drag is wanted (`sheet` covers the rest)
- [ ] **scroll-area** (shadcn): styled scrollbars (`scrollbar-*`), no logic
- [ ] **scrollspy** (Bootstrap): marks the visible section in a table of contents (`aria-current`)
- [ ] **resizable** (shadcn): split panes with a keyboard-operable separator (`role="separator"`, `aria-valuenow`)
- [ ] **input-otp** (shadcn): one native input per box or one input with box styling, paste fills all
- [ ] Small ones: **kbd**, **button-group** (Bootstrap, shadcn), **close-button** (Bootstrap), **aspect-ratio**, **empty** (empty state)
- [ ] **carousel** (shadcn, Bootstrap): scroll-snap with prev/next buttons, `aria-roledescription="carousel"`
- [ ] **calendar** and **date-picker** (shadcn, Material datepicker): on the Aria grid, `Intl` for locale, a popover for the picker
- [ ] **timepicker** (Material)

Not planned: `chart` and `form` (shadcn builds them on Recharts and react-hook-form, and registry files may import only `@angular/*`; Angular forms already cover `form`), Material `ripple`, `icon`, `grid-list`.
