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
- [ ] **multiselect** (`@angular/aria/combobox` + listbox multi). Test: picks several values, deselects
- [ ] **autocomplete / combobox** (`@angular/aria/combobox`). Test: filters while typing, `aria-activedescendant`, Enter picks
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

## Cross-cutting

- [x] Split the test: one spec per component in `registry/ui/<name>.spec.ts` (the playground spec is gone)
- [x] Automated accessibility check with axe-core on every playground example (`src/app/app.a11y.spec.ts`, initial state + opened panels; `color-contrast` off in jsdom)
- [ ] CLI tests: `init` and `add` on a fresh app, unknown names rejected, existing files not overwritten (checked by hand so far)
- [ ] Publish the CLI to npm (check that the `fizzy-ui` name is free first)
