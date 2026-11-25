import { BaseHarnessFilters, ComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';

/**
 * Test harness for an element with `fzTooltip` (Angular CDK testing). The tip describes its trigger
 * (`aria-describedby`), so `getText()` works whether it shows or not. `show()` hovers and waits out the
 * show delay (half a second): prefer `getText()` when the text is what you test.
 */

export interface FzTooltipHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
}

const until = async (check: () => Promise<boolean>, what: string) => {
  for (const end = Date.now() + 2000; !(await check()); ) {
    if (Date.now() > end) throw new Error(`tooltip did not ${what}`);
    await new Promise((r) => setTimeout(r, 20));
  }
};

export class FzTooltipHarness extends ComponentHarness {
  static hostSelector = '[data-tooltip]';

  static with(options: FzTooltipHarnessFilters = {}) {
    return new HarnessPredicate(FzTooltipHarness, options).addOption('text', options.text, (h, text) =>
      HarnessPredicate.stringMatches(h.getText(), text),
    );
  }

  private readonly document = this.documentRootLocatorFactory();

  async getText() {
    return (await (await this.tip())?.text())?.trim() ?? '';
  }
  async isOpen() {
    const tip = await this.tip();
    return !!tip && !(await tip.getProperty<boolean>('hidden')) && (await tip.getAttribute('data-closing')) === null;
  }
  async show() {
    await (await this.host()).hover();
    await until(() => this.isOpen(), 'show');
  }
  async hide() {
    await (await this.host()).sendKeys(TestKey.ESCAPE);
    await until(async () => !(await this.isOpen()), 'hide');
  }

  private async tip() {
    for (const id of ((await (await this.host()).getAttribute('aria-describedby')) ?? '').split(' ').filter(Boolean)) {
      const el = await this.document.locatorForOptional(`[id="${id}"][role=tooltip]`)();
      if (el) return el;
    }
    return null;
  }
}
