import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo as MenuDemo } from '../../src/app/demos/menu';
import { Demo as MenubarDemo } from '../../src/app/demos/menubar';
import { Demo as ContextMenuDemo } from '../../src/app/demos/context-menu';
import { FzContextMenuHarness, FzMenubarHarness, FzMenuHarness } from './menu.harness';

// jsdom has no popover API (see menu.spec.ts): the overlay calls these.
beforeAll(() => {
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
  proto['showPopover'] ??= function () {};
  proto['hidePopover'] ??= function () {};
});

async function setup<T>(demo: Type<T>) {
  const fixture = TestBed.createComponent(demo);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement, loader: TestbedHarnessEnvironment.loader(fixture) };
}

describe('menu harnesses', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('FzMenuHarness: trigger text, items of its own menu, disabled ones, a click through a submenu', async () => {
    const { el, loader } = await setup(MenuDemo);
    const file = await loader.getHarness(FzMenuHarness.with({ triggerText: 'File' }));
    expect(await file.isOpen()).toBe(false);
    const items = await file.getItems();
    expect(await file.isOpen()).toBe(true);
    expect(await Promise.all(items.map((i) => i.getText()))).toEqual(['New file', 'Open…', 'Share', 'Delete']);
    expect(await items[2].hasSubmenu()).toBe(true);
    expect(await items[3].isDisabled()).toBe(true);
    await file.clickItem({ text: 'Share' }, { text: 'Copy link' });
    expect(el.textContent).toContain('Last action: link');
  });

  it('FzMenuHarness.close: Escape closes it', async () => {
    const { loader } = await setup(MenuDemo);
    const file = await loader.getHarness(FzMenuHarness);
    await file.open();
    await file.close();
    expect(await file.isOpen()).toBe(false);
  });

  it('FzMenubarHarness: top-level items, and a click through to a nested item', async () => {
    const { fixture, loader } = await setup(MenubarDemo);
    const bar = await loader.getHarness(FzMenubarHarness);
    expect(await Promise.all((await bar.getItems()).map((i) => i.getText()))).toEqual(['File', 'Edit', 'View']);
    await bar.clickItem({ text: 'Edit' }, { text: 'Find' }, { text: 'Find next' });
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('find-next');
  });

  it('FzContextMenuHarness: right-click opens it, an item is clicked', async () => {
    const { el, loader } = await setup(ContextMenuDemo);
    const area = await loader.getHarness(FzContextMenuHarness);
    expect(await area.isOpen()).toBe(false);
    expect(await Promise.all((await area.getItems()).map((i) => i.getText()))).toEqual(['Back', 'Reload', 'Inspect']);
    await area.clickItem({ text: 'Reload' });
    expect(el.textContent).toContain('reload');
  });
});
