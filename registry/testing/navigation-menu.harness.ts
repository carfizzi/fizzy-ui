import { BaseHarnessFilters, ComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';

/**
 * Test harness for `nav[fzNavigationMenu]` (Angular CDK testing): disclosure buttons that open panels of links.
 * `await nav.open('Components')`, `await nav.getLinkTexts('Components')`, `await nav.getOpenItem()`.
 */

export interface FzNavigationMenuHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
}

export class FzNavigationMenuHarness extends ComponentHarness {
  static hostSelector = 'nav[fzNavigationMenu]';

  static with(options: FzNavigationMenuHarnessFilters = {}) {
    return new HarnessPredicate(FzNavigationMenuHarness, options).addOption('label', options.label, async (h, label) =>
      HarnessPredicate.stringMatches((await h.host()).getAttribute('aria-label'), label),
    );
  }

  private readonly triggers = this.locatorForAll('button[fzNavigationMenuTrigger]');

  /** The panel buttons' texts. */
  async getTriggerTexts() {
    return Promise.all((await this.triggers()).map(async (t) => (await t.text()).trim()));
  }
  /** The top-level links' texts (no panel). */
  async getLinkTextsOutsidePanels() {
    return Promise.all((await this.locatorForAll('a[fzNavigationMenuLink]')()).map(async (a) => (await a.text()).trim()));
  }
  /** The text of the button whose panel is open, or null. */
  async getOpenItem() {
    for (const trigger of await this.triggers()) if ((await trigger.getAttribute('aria-expanded')) === 'true') return (await trigger.text()).trim();
    return null;
  }
  async open(text: string | RegExp) {
    const trigger = await this.trigger(text);
    if ((await trigger.getAttribute('aria-expanded')) !== 'true') await trigger.click();
  }
  /** Escape, from its button: the panel closes. */
  async close() {
    for (const trigger of await this.triggers()) if ((await trigger.getAttribute('aria-expanded')) === 'true') await trigger.sendKeys(TestKey.ESCAPE);
  }
  /** Opens the panel and returns its links' texts. */
  async getLinkTexts(text: string | RegExp) {
    await this.open(text);
    const id = await (await this.trigger(text)).getAttribute('aria-controls');
    return Promise.all((await this.locatorForAll(`[id="${id}"] a`)()).map(async (a) => (await a.text()).trim()));
  }
  /** Opens the panel and clicks a link in it. */
  async clickLink(text: string | RegExp, link: string | RegExp) {
    await this.open(text);
    const id = await (await this.trigger(text)).getAttribute('aria-controls');
    for (const a of await this.locatorForAll(`[id="${id}"] a`)())
      if (await HarnessPredicate.stringMatches((await a.text()).trim(), link)) return a.click();
    throw new Error(`no link matches ${link}`);
  }

  private async trigger(text: string | RegExp) {
    for (const trigger of await this.triggers()) if (await HarnessPredicate.stringMatches((await trigger.text()).trim(), text)) return trigger;
    throw new Error(`no navigation item matches ${text}`);
  }
}
