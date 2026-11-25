import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harness for `fz-pagination` (Angular CDK testing):
 * `await pager.goToPage(4)`, `await pager.next()`, `await pager.getCurrentPage()`.
 */
export class FzPaginationHarness extends ComponentHarness {
  static hostSelector = 'fz-pagination';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzPaginationHarness, options);
  }

  private readonly buttons = this.locatorForAll('button');

  async getCurrentPage() {
    return Number((await (await this.locatorFor('button[aria-current=page]')()).text()).trim());
  }
  /** The page numbers it shows now (gaps left out). */
  async getPages() {
    return Promise.all((await this.locatorForAll('button[aria-label^="Page "]')()).map(async (b) => Number((await b.text()).trim())));
  }
  async goToPage(page: number) {
    const button = await this.locatorForOptional(`button[aria-label="Page ${page}"]`)();
    if (!button) throw new Error(`page ${page} is not shown (${(await this.getPages()).join(', ')})`);
    await button.click();
  }
  async previous() {
    await (await this.buttons())[0].click();
  }
  async next() {
    await (await this.buttons()).at(-1)!.click();
  }
  async isPreviousDisabled() {
    return (await (await this.buttons())[0].getAttribute('aria-disabled')) === 'true';
  }
  async isNextDisabled() {
    return (await (await this.buttons()).at(-1)!.getAttribute('aria-disabled')) === 'true';
  }
}
