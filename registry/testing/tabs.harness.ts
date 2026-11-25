import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harness for `fzTabs` (Angular CDK testing):
 * `const tabs = await loader.getHarness(FzTabsHarness);`
 * then `await tabs.selectTab({ label: 'Password' })` and `await tabs.getSelectedPanelText()`.
 */

export interface FzTabHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
  selected?: boolean;
}

export class FzTabHarness extends ComponentHarness {
  static hostSelector = '[role=tab]';

  static with(options: FzTabHarnessFilters = {}) {
    return new HarnessPredicate(FzTabHarness, options)
      .addOption('label', options.label, (h, label) => HarnessPredicate.stringMatches(h.getLabel(), label))
      .addOption('selected', options.selected, async (h, selected) => (await h.isSelected()) === selected);
  }

  async getLabel() {
    return (await (await this.host()).text()).trim();
  }
  async isSelected() {
    return (await (await this.host()).getAttribute('aria-selected')) === 'true';
  }
  async isDisabled() {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }
  async select() {
    return (await this.host()).click();
  }
  /** The id of the panel this tab shows. */
  async getPanelId() {
    return (await this.host()).getAttribute('aria-controls');
  }
}

export class FzTabsHarness extends ComponentHarness {
  static hostSelector = '[fzTabs]';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzTabsHarness, options);
  }

  async getTabs(filter: FzTabHarnessFilters = {}) {
    return this.locatorForAll(FzTabHarness.with(filter))();
  }
  async getSelectedTab() {
    return this.locatorFor(FzTabHarness.with({ selected: true }))();
  }
  async selectTab(filter: FzTabHarnessFilters) {
    const [tab] = await this.getTabs(filter);
    if (!tab) throw new Error(`no tab matches ${JSON.stringify(filter)}`);
    await tab.select();
  }
  /** Text of the selected tab's panel. */
  async getSelectedPanelText() {
    const id = await (await this.getSelectedTab()).getPanelId();
    const panel = id ? await this.locatorForOptional(`[id="${id}"]`)() : null;
    return (await panel?.text())?.trim() ?? '';
  }
}
