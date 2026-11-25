import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import axe from 'axe-core';
import registry from '../../registry/registry.json';
import cli from '../../cli/package.json';
import { App } from './app';
import { routes } from './app.routes';
import { DOCS, SIZED } from './docs';

// Runs axe on every docs page and example. color-contrast is off: jsdom has no layout or computed colors.
// region is off for pages and demos: they are tested outside the shell, which provides the landmarks.
async function violations(root: Element, region = false) {
  const { violations } = await axe.run(root, { rules: { 'color-contrast': { enabled: false }, region: { enabled: region } } });
  return violations.map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`);
}

async function page(url: string) {
  const harness = await RouterTestingHarness.create(url);
  await harness.fixture.whenStable(); // the demo and sources load through a resource
  return harness.routeNativeElement!;
}

async function demo(name: string) {
  const [Demo] = await DOCS.find((d) => d.name === name)!.load();
  const fixture = TestBed.createComponent(Demo as Type<unknown>);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  return { el, stable: () => fixture.whenStable() };
}

describe('docs', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] }));
  afterEach(() => (document.body.innerHTML = ''));

  it('has one page per registry component, pointing at the file add copies', () => {
    expect(DOCS.map((d) => d.name).sort()).toEqual(Object.keys(registry.items).sort());
    const items: Record<string, { files: string[] }> = registry.items;
    for (const d of DOCS) expect(items[d.name].files).toEqual([`ui/${d.file}`]);
  });

  it('shell (header, sidebar) has no violations', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(await violations(fixture.nativeElement, true)).toEqual([]);
    expect(fixture.nativeElement.querySelectorAll('nav a').length).toBe(DOCS.length + 4);
    const version = fixture.nativeElement.querySelector('header a[href*="npmjs.com"]');
    expect(version.textContent).toBe(`v${cli.version} on npm`);
  });

  it('⌘K opens the search (no violations); Enter on a result navigates and closes it', async () => {
    const fixture = TestBed.createComponent(App);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const cmdK = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true, cancelable: true }));
    cmdK();
    await fixture.whenStable();
    cmdK(); // already open: no second dialog
    await fixture.whenStable();
    expect(document.querySelectorAll('[role=dialog]').length).toBe(1);
    const input = document.querySelector<HTMLInputElement>('[role=dialog] input[role=combobox]')!;
    expect(document.querySelectorAll('[role=dialog] [role=option]').length).toBe(DOCS.length + 4);
    expect(await violations(document.body)).toEqual([]);

    input.value = 'toggle gr';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/components/toggle-group');
    expect(document.querySelector('[role=dialog]')).toBeNull();
  });

  it.each(['/introduction', '/installation', '/forms', '/theming'])('%s has no violations', async (url) => {
    expect(await violations(await page(url))).toEqual([]);
  });

  it('/forms: submitting the empty example shows the errors on invalid controls, no violations', async () => {
    const harness = await RouterTestingHarness.create('/forms');
    await harness.fixture.whenStable();
    const el = harness.routeNativeElement!;
    el.querySelector<HTMLButtonElement>('app-forms-example button[type=submit]')!.click();
    await harness.fixture.whenStable();
    expect([...el.querySelectorAll('[fzFieldError]')].map((e) => e.textContent!.trim())).toEqual(['Pick a room.', 'Pick a date.']);
    expect(el.querySelector('fz-select')!.getAttribute('aria-invalid')).toBe('true');
    expect(el.querySelector('fz-date-picker button')!.getAttribute('aria-invalid')).toBe('true');
    expect(el.querySelector('[role=status]')!.textContent!.trim()).toBe('');
    expect(await violations(el)).toEqual([]);
  });

  it.each(DOCS.map((d) => d.name))('/components/%s renders its demo and source, no violations', async (name) => {
    const el = await page(`/components/${name}`);
    expect(el.querySelector('h1')!.textContent).toBe(DOCS.find((d) => d.name === name)!.title);
    expect(el.querySelector('[role=tabpanel] ng-component')).not.toBeNull(); // the demo, not "Loading…"
    expect(el.textContent).toContain(`npx fizzy-ui add ${name}`);
    expect(el.querySelector('details code')!.textContent).toContain('export const FZ_');
    // Sized components show one instance per size, each inheriting it from its container.
    const sizes = [...el.querySelectorAll('[data-sizes] > [data-size]')];
    expect(sizes.map((s) => s.getAttribute('data-size'))).toEqual(SIZED.has(name) ? ['xs', 'sm', 'md', 'lg'] : []);
    expect(sizes.every((s) => s.children.length >= 2)).toBe(true); // the component (its @case exists) and the caption
    const harness = DOCS.find((d) => d.name === name)!.harness;
    if (harness) expect(el.textContent).toContain(`npx fizzy-ui add ${name} --harness`);
    if (harness) expect(el.textContent).toContain(`getHarness(${harness})`);
    expect(await violations(el)).toEqual([]);
  });

  it('the accessibility box lists the roles and ARIA attributes of the live demo, and new ones as it is used', async () => {
    const harness = await RouterTestingHarness.create('/components/select');
    await harness.fixture.whenStable();
    const el = harness.routeNativeElement!;
    const codes = () => [...el.querySelectorAll('[data-a11y-box] code')].map((c) => c.textContent);
    expect(el.querySelector('[data-a11y-box]')!.textContent).toContain('No axe-core violations');
    expect(codes()).toContain('combobox');
    expect(codes()).toContain('aria-expanded');
    const closed = codes();
    el.querySelector<HTMLElement>('fz-select')!.click();
    await harness.fixture.whenStable();
    // Opening adds attributes to the combobox (in a browser the inline popup's listbox too; jsdom has no popover API).
    expect(codes().filter((c) => !closed.includes(c)).length).toBeGreaterThan(0);
  });

  it('the code tab shows the demo as a user writes it', async () => {
    const harness = await RouterTestingHarness.create('/components/tabs');
    await harness.fixture.whenStable();
    const el = harness.routeNativeElement!;
    el.querySelectorAll<HTMLElement>('[fzTab]')[1].click();
    await harness.fixture.whenStable();
    const code = el.querySelector('[role=tabpanel]:not([inert]) code')!.textContent!;
    expect(code).toContain("from './ui/tabs'");
    expect(code).not.toContain('registry');
  });

  it('a demo that fails to load shows a message instead of throwing', async () => {
    const doc = DOCS.find((d) => d.name === 'badge')!;
    const load = doc.load;
    doc.load = () => Promise.reject(new Error('chunk gone'));
    try {
      expect((await page('/components/badge')).textContent).toContain('Could not load the example.');
    } finally {
      doc.load = load;
    }
  });

  it('an unknown component says so', async () => {
    expect((await page('/components/nope')).textContent).toContain('There is no component called “nope”');
  });

  // On document.body: popups live in the CDK overlay container, outside the demo.
  it.each([
    ['accordion', (el: HTMLElement) => el.querySelector<HTMLElement>('[ngAccordionTrigger]')!.click()],
    ['tabs', (el: HTMLElement) => el.querySelectorAll<HTMLElement>('[fzTab]')[1].click()],
    ['select', (el: HTMLElement) => el.querySelector<HTMLElement>('fz-select')!.click()],
    ['multiselect', (el: HTMLElement) => el.querySelector<HTMLElement>('fz-multiselect')!.click()],
    ['combobox', (el: HTMLElement) => el.querySelector<HTMLElement>('input[fzCombobox]')!.click()],
    ['tree', (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>('[role=treeitem]')].find((i) => i.textContent!.trim().startsWith('registry'))!.click()],
    ['menu', (el: HTMLElement) => el.querySelector<HTMLElement>('button[aria-haspopup]')!.click()],
    ['popover', (el: HTMLElement) => el.querySelector<HTMLElement>('button[aria-haspopup=dialog]')!.click()],
    ['dialog', (el: HTMLElement) => el.querySelector<HTMLElement>('button')!.click()],
    ['sheet', (el: HTMLElement) => el.querySelector<HTMLElement>('button')!.click()],
    ['alert-dialog', (el: HTMLElement) => el.querySelector<HTMLElement>('button')!.click()],
    ['collapsible', (el: HTMLElement) => el.querySelector<HTMLElement>('button')!.click()],
    ['date-picker', (el: HTMLElement) => el.querySelector<HTMLElement>('button[aria-haspopup]')!.click()],
    ['chips', (el: HTMLElement) => el.querySelector<HTMLElement>('[role=option]')!.click()],
    ['field', (el: HTMLElement) => el.querySelector<HTMLElement>('input')!.dispatchEvent(new FocusEvent('blur'))], // shows the error
    ['toast', (el: HTMLElement) => el.querySelectorAll<HTMLElement>('button')[1].click()], // with description and action
  ] as const)('%s opened has no violations', async (name, open) => {
    const { el, stable } = await demo(name);
    open(el);
    await stable();
    if (name === 'dialog' || name === 'sheet' || name === 'alert-dialog') expect(document.querySelector('.cdk-dialog-container')).not.toBeNull();
    if (name === 'field') expect(document.querySelector('[fzFieldError]')).not.toBeNull();
    if (name === 'toast') expect(document.querySelector('fz-toast-region button')!.textContent).toContain('Undo');
    expect(await violations(document.body)).toEqual([]);
  });
});
