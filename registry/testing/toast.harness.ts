import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harness for the toasts of `FzToaster` (Angular CDK testing). They render in an overlay, so load
 * them from the document root: `const toasts = await TestbedHarnessEnvironment.documentRootLoader(fixture).getAllHarnesses(FzToastHarness)`.
 * Toasts close on their own after a while: read them right after the action that shows them.
 */

export interface FzToastHarnessFilters extends BaseHarnessFilters {
  title?: string | RegExp;
}

export class FzToastHarness extends ComponentHarness {
  static hostSelector = '[data-toast]';

  static with(options: FzToastHarnessFilters = {}) {
    return new HarnessPredicate(FzToastHarness, options).addOption('title', options.title, (h, title) =>
      HarnessPredicate.stringMatches(h.getTitle(), title),
    );
  }

  private readonly paragraphs = this.locatorForAll('p');

  async getTitle() {
    return (await (await this.paragraphs())[0].text()).trim();
  }
  async getDescription() {
    return ((await (await this.paragraphs())[1]?.text()) ?? '').trim();
  }
  /** `default` or `destructive`. */
  async getVariant() {
    return (await (await this.host()).getAttribute('data-variant')) ?? 'default';
  }
  /** The action button's label, or null. */
  async getActionLabel() {
    const action = await this.locatorForOptional('button:not([aria-label="Dismiss"])')();
    return action ? (await action.text()).trim() : null;
  }
  /** Runs the action; the toast closes. */
  async clickAction() {
    await (await this.locatorFor('button:not([aria-label="Dismiss"])')()).click();
  }
  async dismiss() {
    await (await this.locatorFor('button[aria-label="Dismiss"]')()).click();
  }
}
