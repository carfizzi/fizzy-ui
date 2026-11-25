import { BaseHarnessFilters, ComponentHarness, ComponentHarnessConstructor, HarnessPredicate, TestKey } from '@angular/cdk/testing';

/**
 * Test harnesses for `fz-select` and `fz-multiselect` (Angular CDK testing):
 * `const select = await loader.getHarness(FzSelectHarness.with({ label: 'Fruit' }));`
 * then `await select.clickOptions({ text: 'Kiwi' })` and `await select.getValueText()`.
 * The options live in a popup: open it first, or let `getOptions` / `clickOptions` do it.
 */

export interface FzSelectHarnessFilters extends BaseHarnessFilters {
  /** The accessible label (`aria-label`, or the text of the `aria-labelledby` element). */
  label?: string | RegExp;
}

export interface FzSelectOptionHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
  selected?: boolean;
}

export class FzSelectOptionHarness extends ComponentHarness {
  static hostSelector = '[role=option]';

  static with(options: FzSelectOptionHarnessFilters = {}) {
    return new HarnessPredicate(FzSelectOptionHarness, options)
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

export class FzSelectHarness extends ComponentHarness {
  static hostSelector = 'fz-select';

  static with<T extends FzSelectHarness>(this: ComponentHarnessConstructor<T>, options: FzSelectHarnessFilters = {}): HarnessPredicate<T> {
    return new HarnessPredicate(this, options).addOption('label', options.label, (h, label) => HarnessPredicate.stringMatches(h.getLabel(), label));
  }

  protected readonly document = this.documentRootLocatorFactory();

  /** `aria-label`, or the text of the elements in `aria-labelledby`. */
  async getLabel() {
    const host = await this.host();
    const label = await host.getAttribute('aria-label');
    if (label) return label;
    const ids = (await host.getAttribute('aria-labelledby'))?.split(' ').filter(Boolean) ?? [];
    const texts = await Promise.all(ids.map(async (id) => (await (await this.document.locatorForOptional(`[id="${id}"]`)())?.text()) ?? ''));
    return texts.join(' ').trim();
  }
  /** The selected label(s), or '' while the placeholder shows. */
  async getValueText() {
    const span = await this.locatorFor('span')();
    return (await span.getAttribute('data-placeholder')) !== null ? '' : (await span.text()).trim();
  }
  async getPlaceholder() {
    const span = await this.locatorFor('span')();
    return (await span.getAttribute('data-placeholder')) !== null ? (await span.text()).trim() : '';
  }
  async isDisabled() {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }
  async isOpen() {
    return (await (await this.host()).getAttribute('aria-expanded')) === 'true';
  }
  async open() {
    if (!(await this.isOpen())) await (await this.host()).click();
  }
  async close() {
    if (await this.isOpen()) await (await this.host()).sendKeys(TestKey.ESCAPE);
  }
  /** Opens the popup and returns its options. */
  async getOptions(filter: FzSelectOptionHarnessFilters = {}) {
    await this.open();
    const id = await (await this.host()).getAttribute('aria-controls');
    if (!id) throw new Error('the select has no open popup (aria-controls)');
    return this.document.locatorForAll(FzSelectOptionHarness.with({ ...filter, ancestor: `[id="${id}"]` }))();
  }
  /** Opens the popup and clicks every matching option (a select closes after its pick). */
  async clickOptions(filter: FzSelectOptionHarnessFilters = {}) {
    const options = await this.getOptions(filter);
    if (!options.length) throw new Error(`no option matches ${JSON.stringify(filter)}`);
    for (const option of options) await option.click();
  }
}

export class FzMultiselectHarness extends FzSelectHarness {
  static override hostSelector = 'fz-multiselect';
}
