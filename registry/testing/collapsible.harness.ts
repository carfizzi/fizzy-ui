import { BaseHarnessFilters, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harness for `fzCollapsible` (Angular CDK testing): `await section.open()`, `await section.isOpen()`,
 * `await section.getContentText()`. A content container: `await section.getHarness(...)` looks inside.
 */
export class FzCollapsibleHarness extends ContentContainerComponentHarness {
  static hostSelector = '[fzCollapsible]';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzCollapsibleHarness, options);
  }

  private readonly trigger = this.locatorFor('button[fzCollapsibleTrigger]');

  async isOpen() {
    return (await (await this.trigger()).getAttribute('aria-expanded')) === 'true';
  }
  async toggle() {
    await (await this.trigger()).click();
  }
  async open() {
    if (!(await this.isOpen())) await this.toggle();
  }
  async close() {
    if (await this.isOpen()) await this.toggle();
  }
  /** The text of the part it shows and hides ('' while closed). */
  async getContentText() {
    if (!(await this.isOpen())) return '';
    return (await (await this.locatorFor('fz-collapsible-content')()).text()).trim();
  }
}
