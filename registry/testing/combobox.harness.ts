import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harness for `input[fzCombobox]` (Angular CDK testing):
 * `const country = await loader.getHarness(FzComboboxHarness.with({ label: 'Country' }));`
 * then `await country.setValue('sp')`, `await country.selectOption({ text: 'Spain' })`, `await country.getValue()`.
 */

export interface FzComboboxHarnessFilters extends BaseHarnessFilters {
  /** `aria-label`, the `aria-labelledby` text, or the text of its `<label for>`. */
  label?: string | RegExp;
}

export interface FzComboboxOptionHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
}

export class FzComboboxOptionHarness extends ComponentHarness {
  static hostSelector = '[role=option]';

  static with(options: FzComboboxOptionHarnessFilters = {}) {
    return new HarnessPredicate(FzComboboxOptionHarness, options).addOption('text', options.text, (h, text) =>
      HarnessPredicate.stringMatches(h.getText(), text),
    );
  }

  async getText() {
    return (await (await this.host()).text()).trim();
  }
  async isSelected() {
    return (await (await this.host()).getAttribute('aria-selected')) === 'true';
  }
  async click() {
    return (await this.host()).click();
  }
}

export class FzComboboxHarness extends ComponentHarness {
  static hostSelector = 'input[fzCombobox]';

  static with(options: FzComboboxHarnessFilters = {}) {
    return new HarnessPredicate(FzComboboxHarness, options).addOption('label', options.label, (h, label) =>
      HarnessPredicate.stringMatches(h.getLabel(), label),
    );
  }

  private readonly document = this.documentRootLocatorFactory();

  async getLabel() {
    const host = await this.host();
    const label = await host.getAttribute('aria-label');
    if (label) return label;
    const ids = (await host.getAttribute('aria-labelledby'))?.split(' ').filter(Boolean) ?? [];
    const id = await host.getAttribute('id');
    if (!ids.length && id) return (await (await this.document.locatorForOptional(`label[for="${id}"]`)())?.text())?.trim() ?? '';
    const texts = await Promise.all(ids.map(async (i) => (await (await this.document.locatorForOptional(`[id="${i}"]`)())?.text()) ?? ''));
    return texts.join(' ').trim();
  }
  async getValue() {
    return (await this.host()).getProperty<string>('value');
  }
  /** Replaces the text as a user types it: the list opens, filtered. */
  async setValue(text: string) {
    const host = await this.host();
    await host.clear();
    if (text) await host.sendKeys(text);
  }
  async isDisabled() {
    const host = await this.host();
    return (await host.getProperty<boolean>('disabled')) || (await host.getAttribute('aria-disabled')) === 'true';
  }
  async isOpen() {
    return (await (await this.host()).getAttribute('aria-expanded')) === 'true';
  }
  async open() {
    if (!(await this.isOpen())) await (await this.host()).click();
  }
  async focus() {
    return (await this.host()).focus();
  }
  async blur() {
    return (await this.host()).blur();
  }
  /** Opens the list (with every option matching the current text) and returns its options. */
  async getOptions(filter: FzComboboxOptionHarnessFilters = {}) {
    await this.open();
    const id = await (await this.host()).getAttribute('aria-controls');
    if (!id) return [];
    return this.document.locatorForAll(FzComboboxOptionHarness.with({ ...filter, ancestor: `[id="${id}"]` }))();
  }
  /** Clicks the first matching option: its text goes into the input. */
  async selectOption(filter: FzComboboxOptionHarnessFilters) {
    const [option] = await this.getOptions(filter);
    if (!option) throw new Error(`no option matches ${JSON.stringify(filter)}`);
    await option.click();
  }
}
