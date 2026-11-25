import { BaseHarnessFilters, ComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';

/**
 * Test harness for a `fzPopover`, through its `fzPopoverTrigger` button (Angular CDK testing):
 * `const pop = await loader.getHarness(FzPopoverHarness.with({ triggerText: 'Dimensions' }));`
 * `await pop.open()`, then `pop.getPanelLoader()` finds harnesses inside the panel.
 */

export interface FzPopoverHarnessFilters extends BaseHarnessFilters {
  triggerText?: string | RegExp;
}

export class FzPopoverHarness extends ComponentHarness {
  static hostSelector = '[data-popover-trigger]';

  static with(options: FzPopoverHarnessFilters = {}) {
    return new HarnessPredicate(FzPopoverHarness, options).addOption('triggerText', options.triggerText, (h, text) =>
      HarnessPredicate.stringMatches(h.getTriggerText(), text),
    );
  }

  private readonly document = this.documentRootLocatorFactory();

  async getTriggerText() {
    return (await (await this.host()).text()).trim();
  }
  async isOpen() {
    return (await (await this.host()).getAttribute('aria-expanded')) === 'true';
  }
  async open() {
    if (!(await this.isOpen())) await (await this.host()).click();
  }
  /** Escape, from the panel: focus goes back to the trigger. */
  async close() {
    if (await this.isOpen()) await (await this.document.locatorFor(await this.panelSelector())()).sendKeys(TestKey.ESCAPE);
  }
  /** The panel's name (`aria-label`). */
  async getPanelLabel() {
    return (await this.document.locatorFor(await this.panelSelector())()).getAttribute('aria-label');
  }
  async getPanelText() {
    await this.open();
    return (await (await this.document.locatorFor(await this.panelSelector())()).text()).trim();
  }
  /** Opens it; a loader for the harnesses inside the panel. */
  async getPanelLoader() {
    await this.open();
    return this.document.harnessLoaderFor(await this.panelSelector());
  }

  private async panelSelector() {
    return `[id="${await (await this.host()).getAttribute('aria-controls')}"]`;
  }
}
