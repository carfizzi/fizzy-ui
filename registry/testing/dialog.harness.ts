import { BaseHarnessFilters, ContentContainerComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';

/**
 * Test harness for an open `fzDialog` (dialog, sheet, alert dialog), Angular CDK testing. Dialogs render
 * in an overlay outside your component, so load them from the document root:
 * `const dialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(FzDialogHarness.with({ title: 'Delete?' }));`
 * It is a content container: `await dialog.getHarness(FzSelectHarness)` finds harnesses inside it.
 */

export interface FzDialogHarnessFilters extends BaseHarnessFilters {
  title?: string | RegExp;
}

export class FzDialogHarness extends ContentContainerComponentHarness {
  static hostSelector = '.cdk-dialog-container';

  static with(options: FzDialogHarnessFilters = {}) {
    return new HarnessPredicate(FzDialogHarness, options).addOption('title', options.title, (h, title) =>
      HarnessPredicate.stringMatches(h.getTitleText(), title),
    );
  }

  private readonly document = this.documentRootLocatorFactory();

  /** `dialog`, or `alertdialog` for a dialog that asks for a decision. */
  async getRole() {
    return (await (await this.host()).getAttribute('role')) as 'dialog' | 'alertdialog' | null;
  }
  async getTitleText() {
    return this.textOf(await (await this.host()).getAttribute('aria-labelledby'));
  }
  async getDescriptionText() {
    return this.textOf(await (await this.host()).getAttribute('aria-describedby'));
  }
  async getText() {
    return (await (await this.host()).text()).trim();
  }
  /** Escape, as a user would (an alert dialog closes on Escape too, never on a backdrop click). */
  async close() {
    await (await this.host()).sendKeys(TestKey.ESCAPE);
  }

  private async textOf(ids: string | null) {
    const texts = await Promise.all(
      (ids ?? '').split(' ').filter(Boolean).map(async (id) => (await (await this.document.locatorForOptional(`[id="${id}"]`)())?.text()) ?? ''),
    );
    return texts.join(' ').trim();
  }
}
