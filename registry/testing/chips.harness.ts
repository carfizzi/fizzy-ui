import { BaseHarnessFilters, ComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';

/**
 * Test harnesses for `fz-chip-listbox` and `fz-chip-input` (Angular CDK testing):
 * `await (await loader.getHarness(FzChipListboxHarness.with({ label: 'Diet' }))).toggleChips({ text: 'Vegan' })`,
 * `await (await loader.getHarness(FzChipInputHarness)).addTag('urgent')`.
 */

export interface FzChipListboxHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
}

export interface FzChipHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
  selected?: boolean;
}

export class FzChipHarness extends ComponentHarness {
  static hostSelector = '[role=option]';

  static with(options: FzChipHarnessFilters = {}) {
    return new HarnessPredicate(FzChipHarness, options)
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
  async toggle() {
    return (await this.host()).click();
  }
}

export class FzChipListboxHarness extends ComponentHarness {
  static hostSelector = 'fz-chip-listbox';

  static with(options: FzChipListboxHarnessFilters = {}) {
    return new HarnessPredicate(FzChipListboxHarness, options).addOption('label', options.label, (h, label) =>
      HarnessPredicate.stringMatches(h.getLabel(), label),
    );
  }

  private readonly listbox = this.locatorFor('[role=listbox]');
  private readonly document = this.documentRootLocatorFactory();

  /** `aria-label`, or the text of the `aria-labelledby` elements (a `fzField` label). */
  async getLabel() {
    const listbox = await this.listbox();
    const label = await listbox.getAttribute('aria-label');
    if (label) return label;
    const ids = (await listbox.getAttribute('aria-labelledby'))?.split(' ').filter(Boolean) ?? [];
    const texts = await Promise.all(ids.map(async (id) => (await (await this.document.locatorForOptional(`[id="${id}"]`)())?.text()) ?? ''));
    return texts.join(' ').trim();
  }
  async isDisabled() {
    return (await (await this.listbox()).getAttribute('aria-disabled')) === 'true';
  }
  async getChips(filter: FzChipHarnessFilters = {}) {
    return this.locatorForAll(FzChipHarness.with(filter))();
  }
  async getSelectedTexts() {
    return Promise.all((await this.getChips({ selected: true })).map((c) => c.getText()));
  }
  /** Clicks every matching chip (with `multiple`, each one toggles). */
  async toggleChips(filter: FzChipHarnessFilters) {
    const chips = await this.getChips(filter);
    if (!chips.length) throw new Error(`no chip matches ${JSON.stringify(filter)}`);
    for (const chip of chips) await chip.toggle();
  }
}

export class FzChipInputHarness extends ComponentHarness {
  static hostSelector = 'fz-chip-input';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzChipInputHarness, options);
  }

  private readonly input = this.locatorFor('input');

  async getTags() {
    return Promise.all((await this.locatorForAll('li')()).map(async (li) => (await li.text()).trim()));
  }
  async isDisabled() {
    return (await this.input()).getProperty<boolean>('disabled');
  }
  /** Types the tag and presses Enter. */
  async addTag(tag: string) {
    const input = await this.input();
    await input.sendKeys(tag, TestKey.ENTER);
  }
  /** Clicks the tag's remove button. */
  async removeTag(tag: string) {
    const button = await this.locatorForOptional(`button[aria-label="Remove ${tag.replaceAll('"', '\\"')}"]`)();
    if (!button) throw new Error(`no tag "${tag}"`);
    await button.click();
  }
  async blur() {
    await (await this.input()).blur();
  }
}
