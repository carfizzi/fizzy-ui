import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harness for `fzListbox` (Angular CDK testing):
 * `const fruits = await loader.getHarness(FzListboxHarness.with({ label: 'Fruits' }));`
 * `await fruits.selectOptions({ text: /Apple|Kiwi/ })`, `await fruits.getSelectedTexts()`.
 */

export interface FzListboxHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
}

export interface FzListboxOptionHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
  selected?: boolean;
}

export class FzListboxOptionHarness extends ComponentHarness {
  static hostSelector = '[role=option]';

  static with(options: FzListboxOptionHarnessFilters = {}) {
    return new HarnessPredicate(FzListboxOptionHarness, options)
      .addOption('text', options.text, (h, text) => HarnessPredicate.stringMatches(h.getText(), text))
      .addOption('selected', options.selected, async (h, selected) => (await h.isSelected()) === selected);
  }

  async getText() {
    return (await (await this.host()).text()).trim();
  }
  async isSelected() {
    return (await (await this.host()).getAttribute('aria-selected')) === 'true';
  }
  async isDisabled() {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }
  async click() {
    return (await this.host()).click();
  }
}

export class FzListboxHarness extends ComponentHarness {
  static hostSelector = '[fzListbox]';

  static with(options: FzListboxHarnessFilters = {}) {
    return new HarnessPredicate(FzListboxHarness, options).addOption('label', options.label, async (h, label) =>
      HarnessPredicate.stringMatches((await h.host()).getAttribute('aria-label'), label),
    );
  }

  async isDisabled() {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }
  async isMultiple() {
    return (await (await this.host()).getAttribute('aria-multiselectable')) === 'true';
  }
  async getOptions(filter: FzListboxOptionHarnessFilters = {}) {
    return this.locatorForAll(FzListboxOptionHarness.with(filter))();
  }
  async getSelectedTexts() {
    return Promise.all((await this.getOptions({ selected: true })).map((o) => o.getText()));
  }
  /** Clicks every matching option (how a click selects depends on `selectionMode`). */
  async selectOptions(filter: FzListboxOptionHarnessFilters) {
    const options = await this.getOptions(filter);
    if (!options.length) throw new Error(`no option matches ${JSON.stringify(filter)}`);
    for (const option of options) await option.click();
  }
}
