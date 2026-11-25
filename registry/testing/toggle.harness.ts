import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harnesses for `fzToggle` and `fzToggleGroup` (Angular CDK testing): both are `aria-pressed` buttons.
 * `const align = await loader.getHarness(FzToggleGroupHarness.with({ label: 'Alignment' }));`
 * `await align.clickItem({ text: 'Center' })`, `await align.getPressedTexts()`.
 */

export interface FzToggleHarnessFilters extends BaseHarnessFilters {
  /** Its accessible name: the `aria-label` (an icon button), else its text. */
  text?: string | RegExp;
  pressed?: boolean;
}

abstract class PressedButtonHarness extends ComponentHarness {
  /** The accessible name: `aria-label` (an icon button), else the text. */
  async getText() {
    const host = await this.host();
    return (await host.getAttribute('aria-label')) ?? (await host.text()).trim();
  }
  async isPressed() {
    return (await (await this.host()).getAttribute('aria-pressed')) === 'true';
  }
  async isDisabled() {
    const host = await this.host();
    return (await host.getProperty<boolean>('disabled')) || (await host.getAttribute('aria-disabled')) === 'true';
  }
  async click() {
    return (await this.host()).click();
  }
}

export class FzToggleHarness extends PressedButtonHarness {
  static hostSelector = 'button[fzToggle]';

  static with(options: FzToggleHarnessFilters = {}) {
    return new HarnessPredicate(FzToggleHarness, options)
      .addOption('text', options.text, (h, text) => HarnessPredicate.stringMatches(h.getText(), text))
      .addOption('pressed', options.pressed, async (h, pressed) => (await h.isPressed()) === pressed);
  }

  async toggle() {
    return this.click();
  }
}

export class FzToggleGroupItemHarness extends PressedButtonHarness {
  static hostSelector = '[fzToggleGroupItem]';

  static with(options: FzToggleHarnessFilters = {}) {
    return new HarnessPredicate(FzToggleGroupItemHarness, options)
      .addOption('text', options.text, (h, text) => HarnessPredicate.stringMatches(h.getText(), text))
      .addOption('pressed', options.pressed, async (h, pressed) => (await h.isPressed()) === pressed);
  }
}

export interface FzToggleGroupHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
}

export class FzToggleGroupHarness extends ComponentHarness {
  static hostSelector = '[fzToggleGroup]';

  static with(options: FzToggleGroupHarnessFilters = {}) {
    return new HarnessPredicate(FzToggleGroupHarness, options).addOption('label', options.label, async (h, label) =>
      HarnessPredicate.stringMatches((await h.host()).getAttribute('aria-label'), label),
    );
  }

  async isDisabled() {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }
  async getItems(filter: FzToggleHarnessFilters = {}) {
    return this.locatorForAll(FzToggleGroupItemHarness.with(filter))();
  }
  async getPressedTexts() {
    return Promise.all((await this.getItems({ pressed: true })).map((i) => i.getText()));
  }
  async clickItem(filter: FzToggleHarnessFilters) {
    const [item] = await this.getItems(filter);
    if (!item) throw new Error(`no item matches ${JSON.stringify(filter)}`);
    await item.click();
  }
}
