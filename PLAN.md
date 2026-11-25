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
- [x] Component search (like ui.shadcn.com): a header button and ⌘K / Ctrl+K open a dialog with `fz-command` over guides and components (name and description as keywords); Enter navigates and closes. Tested in `app.a11y.spec.ts` (axe on the open dialog) and in Chrome
- [x] Deploy: GitHub Pages at carfizzi.github.io/fizzy-ui/ (`.github/workflows/pages.yml`: tests, build with `--base-href /fizzy-ui/`, `404.html` fallback for deep links; demo links are relative to the base href)
  - [x] Prerendered: one HTML file per page (62), hydrated; deep links answer 200; `index.csr.html` is the 404 fallback. Checked in Chrome: no hydration errors, demos interactive, theme state, trailing slash

## Cross-cutting

- [x] Split the test: one spec per component in `registry/ui/<name>.spec.ts` (the playground spec is gone)
- [x] Automated accessibility check with axe-core on every docs page and example (`src/app/app.a11y.spec.ts`, initial state + opened panels; `color-contrast` off in jsdom)
- [x] CLI tests (`cli/index.test.mjs`, `npm run test:cli`): `list`, usage, project root check, `add` (several, `--path`), unknown names rejected, existing files kept unless `--overwrite`, a registry cannot write outside `--path`, `init` idempotent, registry from a URL. Package install is not tested (always `--skip-install`)
- [x] Publish the CLI to npm: `fizzy-ui@22.0.0` (Nov 24, 2026; first publish was staged and approved on npmjs.com)
  - [x] Name free (Nov 2026); version 22.0.0 following Angular's major; package metadata, README and LICENSE bundled; `@angular/*` installed at the project's major, with a warning on a mismatch
  - [x] Real install from the packed tarball in a fresh `ng new` app (Angular 22.0): `init`, `add` of all 51 items (aria/cdk installed at ^22.3), every `FZ_*` imported, `ng build` clean, checked in Chrome (sizes, tabs, date picker in a field)
  - [x] Repo public, published, the "Not on npm yet" note removed
  - [ ] Trusted publishing from tags (GitHub Actions, no token)
- [x] Animations and transitions, Apple style (HIG Motion, WWDC23 "Animate with springs"): springs as CSS `linear()`, durations as tokens in `fizzy.css` (0s turns motion off), Reduce Motion swaps scale/slide for fades
  - [x] A: enter animations (dialog, sheet, popover, menu, select, combobox, tooltip), accordion height, switch spring. Checked in Chrome: spring curve, origin from the trigger side, submenus instant, fades only under Reduce Motion
  - [x] B: exit animations for dialog and sheet (CDK `closePredicate`: the first close plays the exit, later ones wait, then it closes with the first result; clicks ignored and focus kept inside meanwhile, backdrop fades alongside, CDK gives focus back at the end with the right focus origin; a background tab closes at once). Checked in Chrome: Escape, backdrop, fzDialogClose, double Escape, reopen during exit, mobile nav, Reduce Motion
  - [x] C: exit animations for popover, menu, select, combobox, tooltip: a 150ms fade (`leave()`: data-closing + inert, detach when the animation ends, cancel on reopen; select/combobox keep the overlay open meanwhile with Aria `preserveContent`). Focus returns at once. Checked in Chrome: no flash, reopen while fading, Reduce Motion
- [x] Checkbox animation: the check mark (and indeterminate bar) springs in, a fade under Reduce Motion. Checked in Chrome
- [x] Tabs: the active-tab indicator slides to the new tab instead of jumping (one indicator element positioned from the selected tab, `ease-spring`; instant under Reduce Motion). Checked in Chrome, both tab lists of the docs page
- [x] Sizes xs, sm, md (default), lg. One scale in `fizzy.css` read through CSS variables; `data-size` on a component (its optional `size` input) or on any container, nearest wins. Controls 28/32/36/40px (button, toggle, toggle-group, input, textarea, select, multiselect, combobox, input-group, chips, pagination, tabs, toolbar), own scales for avatar (24–40px), spinner (12–20px), badge (text). md keeps the old sizes. Button and toggle `default` renamed `md`; `size="icon"` became the `icon` attribute. Theming documents it with a live example; measured in Chrome

## Phase 5: more components (from shadcn, Angular Material, Bootstrap)

In priority order. Each one needs the usual four pieces (file, `registry.json`, demo + docs entry, spec).

- [x] **toast** (shadcn sonner, Material snackbar, Bootstrap toasts): `FzToaster.show()`, a region in a global CDK overlay (bottom right, full width on phones), announced with the CDK `LiveAnnouncer` (polite, assertive for `destructive`), optional action ("Undo"), timers paused on hover and focus, Alt+T to reach it, Escape dismisses, focus goes back, at most 3, exit with `animate.leave`. Checked in Chrome (desktop, phone, enter/exit, clicks through the empty region)
- [x] **alert** (shadcn, Bootstrap): `role` input (`alert` default, `status`, none), variants (default, destructive), title, description, leading icon. No built-in close button: put an `fzButton` in it
- [x] **progress** (all three): styled native `<progress>`, value springs; indeterminate when there is no value (a sweeping bar, a pulse under Reduce Motion). Checked in Chrome
- [x] **spinner** (Material progress-spinner, Bootstrap, shadcn): `<fz-spinner>`, `role="status"` with a hidden label, pulses under Reduce Motion
- [x] **toggle** and **toggle-group** (shadcn, Material button-toggle, both in `toggle.ts`): `button[fzToggle] [(pressed)]`; the group is an Aria toolbar (one Tab stop, arrows) of `aria-pressed` items, single (pressing again clears) or `multiple` (array)
- [x] **alert-dialog** (shadcn): `dialog.ts` with `role="alertdialog"`: no backdrop close (Escape still cancels), `fzDialogDescription` → `aria-describedby` (plain dialogs too), first focus via `cdkFocusInitial` on Cancel. Checked in Chrome
- [x] **collapsible** (shadcn, Bootstrap collapse, Material expansion panel): a disclosure (`aria-expanded`, `aria-controls`, inert content) with the accordion's height transition; no Aria directive needed. Checked in Chrome
- [x] **chips** (Material, `chips.ts`): `<fz-chip-listbox>` with `<fz-chip>` data (Aria listbox in its own template: horizontal, `explicit`, single or `multiple`) and `<fz-chip-input>` for free tags (Enter or comma adds, Backspace or a remove button deletes, announced; a real `<input>`, so `fzField` labels it). Checked in Chrome with real keys
- [x] **field** (shadcn field, Material form-field): `<div fzField>` wires label (`for`, or `aria-labelledby` for non-inputs like `fz-select`), `fzFieldDescription`, `fzFieldError` (`role="alert"`) with `aria-describedby` / `aria-invalid`, keeping the user's own ids; `orientation="horizontal"`. Checked in Chrome
- [x] **input-group** (shadcn, Bootstrap): `fzInputGroup` + `fzInputGroupAddon` (text, icons, buttons) + `fzInputGroupInput`, styles only, works in `fzField`. Floating label (Bootstrap) not done
- [x] **table** (shadcn, Bootstrap): `table[fzTable]` styles the whole table, `[(sort)]` + `th[fzSortHeader]` (a button inside, `aria-sort` on the sorted column, asc → desc → none; the user sorts rows)
- [ ] Sorting for `grid.ts` (the button would be a grid cell widget)
- [x] **pagination** (shadcn, Bootstrap, Material paginator): `<fz-pagination [(page)] [pageCount]>`, first/last/neighbours/gaps, `aria-current="page"`, Previous/Next `aria-disabled` at the ends, focus kept when the list shifts. Buttons, not links; no page-size select (use `fz-select`)
- [x] **breadcrumb** (shadcn, Bootstrap): `nav[fzBreadcrumb]` + `ol`, CSS-border chevrons (nothing to read), `aria-current="page"` set by the user
- [x] **list-group** (Bootstrap list group, Material list): `fzListGroup` + `fzListGroupItem` on li, a or button; pointer styles only on links and buttons, current row from `aria-current`
- [x] **stepper** (Material, `stepper.ts`): `<fz-stepper [(step)] linear>` + `<fz-step label [completed]>`; an `ol` of buttons with `aria-current="step"` (not Aria tabs: APG does not recommend tabs for a wizard), locked steps `aria-disabled`, `next()`/`previous()` focus the new header, hidden steps keep their content, horizontal/vertical, labels of other steps hidden on phones. Checked in Chrome (desktop, phone, real keys)
- [x] **command** (shadcn, `command.ts`): `<fz-command>` with `fz-command-group` / `fz-command-item` data; Aria combobox `alwaysExpanded` + listbox (activedescendant), filter on label and keywords (label matches first), first match highlighted (`gotoFirst`), `(itemSelected)`, Escape forwarded to a dialog around it. Checked in Chrome with real keys
- [x] **hover-card** (shadcn): the popover overlay pattern opened on hover (500ms) or keyboard focus (at once); hoverable, Escape from anywhere (WCAG 1.4.13), inline DOM so Tab enters it, no touch, not announced. Checked in Chrome (mouse, Tab, Escape)
- [x] **navigation-menu** (shadcn, Bootstrap navbar): the APG disclosure navigation pattern, not a menubar (menu roles are for app menus): buttons with `aria-expanded` open panels of plain links; one at a time; click or hover (150ms, a click right after keeps it), Escape (focus back), click outside, focus leaving; panels fade out. Checked in Chrome (mouse through the gap, Tab, Escape). Responsive: use the sidebar on phones
- [x] **sidebar** (shadcn, Material sidenav): `fzSidebarLayout [(open)]` + `<fz-sidebar>` + `fzSidebarTrigger`, `fzSidebarGroupLabel`, `fzSidebarItem`. Wide screens: a column that collapses with a spring (inert when closed). Below md: a drawer that is a modal dialog by making everything else inert (no focus trap), focus inside, Escape / backdrop / link close it, focus back to the trigger. Checked in Chrome (desktop, phone, real keys). Not yet: an icon-only rail when collapsed; the docs shell still has its own nav
- [ ] **drawer** (shadcn): bottom sheet with drag to close; skip unless drag is wanted (`sheet` covers the rest)
- [x] **scroll-area** (shadcn): native scrolling with a thin scrollbar, edges fade (CSS mask) where there is more, a Tab stop only while it overflows, a named `region` with an aria-label; the host draws the focus ring (the mask would clip it). Checked in Chrome: arrows, End, horizontal, fades
- [ ] **scrollspy** (Bootstrap): marks the visible section in a table of contents (`aria-current`)
- [ ] **resizable** (shadcn): split panes with a keyboard-operable separator (`role="separator"`, `aria-valuenow`)
- [x] **input-otp** (shadcn): one native input (transparent, over aria-hidden boxes): paste of "123 456", `autocomplete="one-time-code"`, numeric keyboard, screen readers as a text field; `complete` output, digits or alphanumeric, works in `fzField`. Checked in Chrome: click, typing, Backspace, paste, Home, error and success
- [x] Small ones: **kbd** (native `<kbd>`, nested for combinations; used in the docs header and keyboard tables), **button-group** (`role=group`, joined corners horizontal or vertical, size inherited; arrows are the toolbar's job), **close-button** (named "Close", sized), **aspect-ratio** (CSS `aspect-ratio`), **empty** (empty state: media, title at the user's heading level, description, actions). Checked in Chrome: corners and overlaps, 28/32/36/40px, focus after dismiss, numeric ratio
- [ ] **carousel** (shadcn, Bootstrap): scroll-snap with prev/next buttons, `aria-roledescription="carousel"`
- [x] **calendar** and **date-picker** (shadcn, Material datepicker; both in `calendar.ts`): the APG date grid (own roving tabindex, not Aria's grid, whose cells are fixed while arrows cross months): arrows, Home/End, PageUp/Down (Shift: year), full day names, `aria-current="date"`, `min`/`max`/`disabled`, `Intl` + `LOCALE_ID` for names and first weekday. The picker: a button + `cdkConnectedOverlay` dialog, focus on the day, pick/Escape refocus the button; in `fzField` named "label, date". Checked in Chrome (real keys, accessibility tree). Not yet: typing a date, ranges
- [ ] **timepicker** (Material)

## Phase 6: forms and small wins

- [x] **Forms support** (Signal Forms, Reactive Forms, `ngModel`): no CVA, Angular 22 binds a `value` model directly. select, multiselect, combobox (`ngNoCva`), chip-listbox, chip-input, input-otp, calendar, date-picker, toggle-group have `touch` and a boolean `disabled`, and read null as empty; `aria-invalid` comes from `fzField`. Renamed what forms set by name: calendar/date-picker `disabled` (days) → `dateDisabled`, input-otp `pattern` → `charset`. `registry/ui/forms.spec.ts`: each control × each API (value both ways, touched, disabled). Docs: Forms guide. Native controls rely on Angular's own accessors (not re-tested). Checked in headless Chrome over CDP, light and dark: submit shows both errors (red border and label), picking clears them, the example books
- [x] **Size preview in the docs**: a "Sizes" section on the page of each sized component (`SIZED` in `docs.ts`): one small instance per size in a `data-size` container, from `src/app/demos/sizes.ts` (one `@case` per component, loaded lazily). The a11y spec checks the four sizes render and axe passes. Measured in headless Chrome: 28/32/36/40px on every control, light and dark
- [ ] **RTL**: check for `left/right` (use logical properties), add a demo with `dir="rtl"`, test the popups and the tab highlight

## Phase 7: docs and tooling

- [ ] **llms.txt + markdown per component**: generated from `docs.ts` (description, keyboard table, a11y notes) and the demos: `/llms.txt`, `/<name>.md`. Cheap, and the base for the MCP idea and an agent skill
- [ ] **CLI `diff` and `update`**: the code is the user's, so it drifts. `diff <name>` compares the local file with the registry version; `update <name>` merges (or asks per file). Check first how `add` handles internal dependencies and overwrites
- [ ] **Open in StackBlitz** on each demo

## Phase 8: trust and look

- [ ] **A11y you can show**: axe result badge on the site (from `app.a11y.spec.ts`), keyboard + ARIA box per component; CDK `ComponentHarness` per component (`registry/testing`) so users can test their own apps
- [ ] **Themes**: presets (`init --theme`) and a token editor on the site that outputs the CSS

## Phase 9: agents (needs phase 6 and the llms.txt data)

- [ ] **MCP support**: an MCP server over `registry/` (list components, read a component's source and docs, `add`), so agents can use fizzy-ui; the CLI already knows the registry
- [ ] **Agent bridge** (inspired by https://ui-sdk.dev, docs read; their behaviors/primitives are not needed, `@angular/aria` covers them): `agent.ts`, a root service `FzAgent` (like `FzToaster`) + directive `fzAgent` that registers a control with label, state and actions.
  - API: `snapshot()` (components with state and `actions`), `act({steps:[{ref, action, args}]})` (ref = snapshot ref, label or row text; ambiguous fails and lists candidates; stops at the first error, no rollback), `subscribe()` (changes with `source: 'agent' | 'user'`).
  - Native controls (input, checkbox, switch, slider): set the value and dispatch `input`/`change`, so Angular forms react. Aria components use their own API (`open`, selected tab). Label read like `field.ts` does.
  - Safety: `allow(step, {signal})` required (may be async, for a confirm UI); markup `data-agent-confirm` (needs a person), `data-agent-hidden`, `data-agent-secret` (password, card, OTP secret by default).
  - Registration in `afterNextRender` (prerendered site). Optional later: WebMCP adapter (`document.modelContext.registerTool`: `snapshot`, `act`, `query`; only if the API exists; its input schemas are ours to define).
  - Not taking: paginated `query`, history/undo, run-on-server.
  - First step: prototype with `fz-input` + `fz-checkbox`, spec, demo. Ties in with the MCP and AI Elements ideas (MCP serves agents that build with fizzy-ui; the bridge serves agents that use the built app)
- [ ] **AI Elements** (agent UIs): chat message, conversation (scroll to bottom), prompt input, reasoning/tool-call blocks, streaming text, sources, code block; built on existing pieces (`field`, `scroll-area`, `collapsible`, `toast`)

## Phase 10: big pieces

- [ ] **Data table**: grid + sorting, filters, pagination, row selection (see the open sorting item in Phase 5)
- [ ] **Blocks** (composed pages installable with `add`): login, settings, dashboard with sidebar, table with filters
- [ ] **`ng add fizzy-ui`** next to `init` (the schematic runs the same setup)

Order inside a phase is the order to do them. Hard dependencies: forms before the agent bridge, llms.txt before MCP, data table before blocks.

Not planned: `chart` and `form` (shadcn builds them on Recharts and react-hook-form, and registry files may import only `@angular/*`; Angular forms already cover `form`), Material `ripple`, `icon`, `grid-list`.
