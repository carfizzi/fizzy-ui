import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harness for `fz-command` (Angular CDK testing):
 * `await palette.search('cal')`, `await palette.getItemTexts()`, `await palette.selectItem({ text: 'Calendar' })`.
 */

export interface FzCommandItemHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
}

export class FzCommandItemHarness extends ComponentHarness {
  static hostSelector = '[role=option]';

  static with(options: FzCommandItemHarnessFilters = {}) {
    return new HarnessPredicate(FzCommandItemHarness, options).addOption('text', options.text, (h, text) =>
      HarnessPredicate.stringMatches(h.getText(), text),
    );
  }

  /** The label, without the shortcut. */
  async getText() {
    const all = await (await this.host()).text();
    return all.replace(await this.getShortcut(), '').trim();
  }
  /** The shortcut shown after the label ('' if none). */
  async getShortcut() {
    return (await (await this.locatorForOptional('span')())?.text())?.trim() ?? '';
  }
  async isDisabled() {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }
  async click() {
    return (await this.host()).click();
  }
}

export class FzCommandHarness extends ComponentHarness {
  static hostSelector = 'fz-command';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzCommandHarness, options);
  }

  private readonly input = this.locatorFor('input');

  async getQuery() {
    return (await this.input()).getProperty<string>('value');
  }
  /** Types the query, as a user filters the list. */
  async search(query: string) {
    const input = await this.input();
    await input.clear();
    if (query) await input.sendKeys(query);
  }
  async getItems(filter: FzCommandItemHarnessFilters = {}) {
    return this.locatorForAll(FzCommandItemHarness.with(filter))();
  }
  async getItemTexts() {
    return Promise.all((await this.getItems()).map((i) => i.getText()));
  }
  /** The group headings shown now. */
  async getGroupHeadings() {
    return Promise.all((await this.locatorForAll('[role=presentation] > [aria-hidden=true][id]')()).map(async (h) => (await h.text()).trim()));
  }
  async selectItem(filter: FzCommandItemHarnessFilters) {
    const [item] = await this.getItems(filter);
    if (!item) throw new Error(`no command matches ${JSON.stringify(filter)}`);
    await item.click();
  }
}
