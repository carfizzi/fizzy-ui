import { BaseHarnessFilters, ComponentHarness, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harness for `fzAccordion` and its `fz-accordion-item`s (Angular CDK testing):
 * `const item = await loader.getHarness(FzAccordionItemHarness.with({ title: 'Shipping' }));`
 * then `await item.expand()`, `await item.isExpanded()`, `await item.getContentText()`.
 * An item is a content container: `await item.getHarness(...)` looks inside its panel.
 */

export interface FzAccordionItemHarnessFilters extends BaseHarnessFilters {
  title?: string | RegExp;
  expanded?: boolean;
}

export class FzAccordionItemHarness extends ContentContainerComponentHarness {
  static hostSelector = 'fz-accordion-item';

  static with(options: FzAccordionItemHarnessFilters = {}) {
    return new HarnessPredicate(FzAccordionItemHarness, options)
      .addOption('title', options.title, (h, title) => HarnessPredicate.stringMatches(h.getTitle(), title))
      .addOption('expanded', options.expanded, async (h, expanded) => (await h.isExpanded()) === expanded);
  }

  private readonly trigger = this.locatorFor('button[aria-expanded]');

  async getTitle() {
    return (await (await this.trigger()).text()).trim();
  }
  async isExpanded() {
    return (await (await this.trigger()).getAttribute('aria-expanded')) === 'true';
  }
  async isDisabled() {
    const trigger = await this.trigger();
    return (await trigger.getProperty<boolean>('disabled')) || (await trigger.getAttribute('aria-disabled')) === 'true';
  }
  async toggle() {
    return (await this.trigger()).click();
  }
  async expand() {
    if (!(await this.isExpanded())) await this.toggle();
  }
  async collapse() {
    if (await this.isExpanded()) await this.toggle();
  }
  /** The panel's text ('' before it was first opened: the content renders on open). */
  async getContentText() {
    const panel = await this.locatorForOptional('[role=region]')();
    return (await panel?.text())?.trim() ?? '';
  }
}

export class FzAccordionHarness extends ComponentHarness {
  static hostSelector = '[fzAccordion]';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzAccordionHarness, options);
  }

  async getItems(filter: FzAccordionItemHarnessFilters = {}) {
    return this.locatorForAll(FzAccordionItemHarness.with(filter))();
  }
}
