import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harness for `fzToolbar` and its `fzToolbarItem`s (Angular CDK testing):
 * `const bar = await loader.getHarness(FzToolbarHarness.with({ label: 'Text formatting' }));`
 * `await bar.clickItem({ text: 'Bold' })`, `await (await bar.getItems({ pressed: true }))…`.
 */

export interface FzToolbarHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
}

export interface FzToolbarItemHarnessFilters extends BaseHarnessFilters {
  /** The accessible name: `aria-label` (an icon button), else the text. */
  text?: string | RegExp;
  pressed?: boolean;
}

export class FzToolbarItemHarness extends ComponentHarness {
  static hostSelector = '[fzToolbarItem]';

  static with(options: FzToolbarItemHarnessFilters = {}) {
    return new HarnessPredicate(FzToolbarItemHarness, options)
      .addOption('text', options.text, (h, text) => HarnessPredicate.stringMatches(h.getText(), text))
      .addOption('pressed', options.pressed, async (h, pressed) => (await h.isPressed()) === pressed);
  }

  async getText() {
    const host = await this.host();
    return (await host.getAttribute('aria-label')) ?? (await host.text()).trim();
  }
  /** A toggle item's state (`aria-pressed`); false for a plain button. */
  async isPressed() {
    return (await (await this.host()).getAttribute('aria-pressed')) === 'true';
  }
  async isDisabled() {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }
  async click() {
    return (await this.host()).click();
  }
}

export class FzToolbarHarness extends ComponentHarness {
  static hostSelector = '[fzToolbar]';

  static with(options: FzToolbarHarnessFilters = {}) {
    return new HarnessPredicate(FzToolbarHarness, options).addOption('label', options.label, async (h, label) =>
      HarnessPredicate.stringMatches((await h.host()).getAttribute('aria-label'), label),
    );
  }

  async isDisabled() {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }
  async getItems(filter: FzToolbarItemHarnessFilters = {}) {
    return this.locatorForAll(FzToolbarItemHarness.with(filter))();
  }
  async clickItem(filter: FzToolbarItemHarnessFilters) {
    const [item] = await this.getItems(filter);
    if (!item) throw new Error(`no toolbar item matches ${JSON.stringify(filter)}`);
    await item.click();
  }
}
