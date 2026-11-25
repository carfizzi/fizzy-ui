import { BaseHarnessFilters, ComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';

/**
 * Test harnesses for menus (Angular CDK testing): a button with `[fzMenuTrigger]`, a `fzMenubar`, a `fzContextMenu`.
 * `const file = await loader.getHarness(FzMenuHarness.with({ triggerText: 'File' }));`
 * `await file.clickItem({ text: 'Share' }, { text: 'Email' });` follows submenus: one filter per level.
 */

export interface FzMenuItemHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
}

export class FzMenuItemHarness extends ComponentHarness {
  static hostSelector = '[role=menuitem]';

  static with(options: FzMenuItemHarnessFilters = {}) {
    return new HarnessPredicate(FzMenuItemHarness, options).addOption('text', options.text, (h, text) =>
      HarnessPredicate.stringMatches(h.getText(), text),
    );
  }

  async getText() {
    return (await (await this.host()).text()).trim();
  }
  async isDisabled() {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }
  async hasSubmenu() {
    const popup = await (await this.host()).getAttribute('aria-haspopup');
    return popup !== null && popup !== 'false';
  }
  async click() {
    return (await this.host()).click();
  }
  /** The id of the submenu this item opens. */
  async getSubmenuId() {
    return (await this.host()).getAttribute('aria-controls');
  }
}

/** Shared: the items of the menu an element controls, and clicking through submenus. */
abstract class FzMenuItemsHarness extends ComponentHarness {
  protected readonly document = this.documentRootLocatorFactory();

  protected async itemsIn(menuId: string | null, filter: FzMenuItemHarnessFilters) {
    if (!menuId) throw new Error('the menu is not open (no aria-controls)');
    // Only the menu's own items: a nested submenu sits inside its parent in the DOM.
    const items = await this.document.locatorForAll(FzMenuItemHarness.with({ ...filter, ancestor: `[id="${menuId}"]` }))();
    const own = await Promise.all(
      items.map(async (item) => (await (await item.host()).matchesSelector(`[id="${menuId}"] [role=menu] [role=menuitem]`)) ? null : item),
    );
    return own.filter((i): i is FzMenuItemHarness => !!i);
  }

  protected async clickThrough(menuId: string | null, filters: FzMenuItemHarnessFilters[]) {
    for (const [i, filter] of filters.entries()) {
      const [item] = await this.itemsIn(menuId, filter);
      if (!item) throw new Error(`no menu item matches ${JSON.stringify(filter)}`);
      await item.click();
      if (i < filters.length - 1) menuId = await item.getSubmenuId();
    }
  }
}

export interface FzMenuHarnessFilters extends BaseHarnessFilters {
  triggerText?: string | RegExp;
}

/** A menu, through the button that opens it. */
export class FzMenuHarness extends FzMenuItemsHarness {
  static hostSelector = '[data-menu-trigger]';

  static with(options: FzMenuHarnessFilters = {}) {
    return new HarnessPredicate(FzMenuHarness, options).addOption('triggerText', options.triggerText, (h, text) =>
      HarnessPredicate.stringMatches(h.getTriggerText(), text),
    );
  }

  async getTriggerText() {
    return (await (await this.host()).text()).trim();
  }
  async isOpen() {
    return (await (await this.host()).getAttribute('aria-expanded')) === 'true';
  }
  async isDisabled() {
    const host = await this.host();
    return (await host.getProperty<boolean>('disabled')) || (await host.getAttribute('aria-disabled')) === 'true';
  }
  async open() {
    if (!(await this.isOpen())) await (await this.host()).click();
  }
  /** Escape, from inside the menu: it closes and focus goes back to the trigger. */
  async close() {
    if (!(await this.isOpen())) return;
    const menu = await this.document.locatorFor(`[id="${await (await this.host()).getAttribute('aria-controls')}"]`)();
    await menu.sendKeys(TestKey.ESCAPE);
  }
  /** Opens the menu and returns its own items (not those of its submenus). */
  async getItems(filter: FzMenuItemHarnessFilters = {}) {
    await this.open();
    return this.itemsIn(await (await this.host()).getAttribute('aria-controls'), filter);
  }
  /** Opens the menu and clicks an item; more filters click on through submenus. */
  async clickItem(filter: FzMenuItemHarnessFilters, ...submenus: FzMenuItemHarnessFilters[]) {
    await this.open();
    await this.clickThrough(await (await this.host()).getAttribute('aria-controls'), [filter, ...submenus]);
  }
}

/** A `fzMenubar`: its top-level items open menus. */
export class FzMenubarHarness extends FzMenuItemsHarness {
  static hostSelector = '[role=menubar]';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzMenubarHarness, options);
  }

  /** The top-level items (not those of the menus they open). */
  async getItems(filter: FzMenuItemHarnessFilters = {}) {
    const items = await this.locatorForAll(FzMenuItemHarness.with(filter))();
    const top = await Promise.all(items.map(async (i) => ((await (await i.host()).matchesSelector('[role=menu] [role=menuitem]')) ? null : i)));
    return top.filter((i): i is FzMenuItemHarness => !!i);
  }
  /** Clicks a top-level item, then on through the menus it opens: `clickItem({ text: 'File' }, { text: 'New' })`. */
  async clickItem(filter: FzMenuItemHarnessFilters, ...submenus: FzMenuItemHarnessFilters[]) {
    const [item] = await this.getItems(filter);
    if (!item) throw new Error(`no menubar item matches ${JSON.stringify(filter)}`);
    await item.click();
    if (submenus.length) await this.clickThrough(await item.getSubmenuId(), submenus);
  }
}

/** A `fzContextMenu` area: right-click opens its menu at the pointer. */
export class FzContextMenuHarness extends FzMenuItemsHarness {
  static hostSelector = '[data-context-menu]';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzContextMenuHarness, options);
  }

  private readonly anchor = this.locatorFor('[ngMenuTrigger]');

  async isOpen() {
    return (await (await this.anchor()).getAttribute('aria-expanded')) === 'true';
  }
  /** Right-clicks the area (at x, y from its top left). */
  async open(x = 0, y = 0) {
    await (await this.host()).rightClick(x, y);
  }
  async getItems(filter: FzMenuItemHarnessFilters = {}) {
    if (!(await this.isOpen())) await this.open();
    return this.itemsIn(await (await this.anchor()).getAttribute('aria-controls'), filter);
  }
  async clickItem(filter: FzMenuItemHarnessFilters, ...submenus: FzMenuItemHarnessFilters[]) {
    if (!(await this.isOpen())) await this.open();
    await this.clickThrough(await (await this.anchor()).getAttribute('aria-controls'), [filter, ...submenus]);
  }
}
