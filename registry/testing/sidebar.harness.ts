import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harness for a `fzSidebarLayout` (Angular CDK testing): its `fz-sidebar`, `fzSidebarTrigger` and items.
 * `await layout.toggle()`, `await layout.isOpen()`, `await layout.clickItem({ text: 'Settings' })`, `await layout.getCurrentItemText()`.
 */

export interface FzSidebarItemHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
  current?: boolean;
}

export class FzSidebarItemHarness extends ComponentHarness {
  static hostSelector = '[fzSidebarItem]';

  static with(options: FzSidebarItemHarnessFilters = {}) {
    return new HarnessPredicate(FzSidebarItemHarness, options)
      .addOption('text', options.text, (h, text) => HarnessPredicate.stringMatches(h.getText(), text))
      .addOption('current', options.current, async (h, current) => (await h.isCurrent()) === current);
  }

  async getText() {
    return (await (await this.host()).text()).trim();
  }
  /** `aria-current="page"`. */
  async isCurrent() {
    return (await (await this.host()).getAttribute('aria-current')) === 'page';
  }
  async click() {
    return (await this.host()).click();
  }
}

export class FzSidebarHarness extends ComponentHarness {
  static hostSelector = '[fzSidebarLayout]';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzSidebarHarness, options);
  }

  private readonly trigger = this.locatorForOptional('button[fzSidebarTrigger]');
  private readonly sidebar = this.locatorFor('fz-sidebar');

  async isOpen() {
    return (await (await this.sidebar()).getAttribute('data-state')) === 'open';
  }
  /** Clicks the `fzSidebarTrigger`. */
  async toggle() {
    const trigger = await this.trigger();
    if (!trigger) throw new Error('no fzSidebarTrigger in this layout');
    await trigger.click();
  }
  async getItems(filter: FzSidebarItemHarnessFilters = {}) {
    return this.locatorForAll(FzSidebarItemHarness.with(filter))();
  }
  async getCurrentItemText() {
    const [item] = await this.getItems({ current: true });
    return item ? item.getText() : null;
  }
  async clickItem(filter: FzSidebarItemHarnessFilters) {
    const [item] = await this.getItems(filter);
    if (!item) throw new Error(`no sidebar item matches ${JSON.stringify(filter)}`);
    await item.click();
  }
}
