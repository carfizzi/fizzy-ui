import { BaseHarnessFilters, ComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';

/**
 * Test harness for `fz-tree` (Angular CDK testing):
 * `const files = await loader.getHarness(FzTreeHarness.with({ label: 'Project files' }));`
 * `await (await files.getItem({ text: 'src' })).expand()`, then `await files.getItems({ level: 2 })`.
 */

export interface FzTreeHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
}

export interface FzTreeItemHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
  level?: number;
  expanded?: boolean;
  selected?: boolean;
}

export class FzTreeItemHarness extends ComponentHarness {
  static hostSelector = '[role=treeitem]';

  static with(options: FzTreeItemHarnessFilters = {}) {
    return new HarnessPredicate(FzTreeItemHarness, options)
      .addOption('text', options.text, (h, text) => HarnessPredicate.stringMatches(h.getText(), text))
      .addOption('level', options.level, async (h, level) => (await h.getLevel()) === level)
      .addOption('expanded', options.expanded, async (h, expanded) => (await h.isExpanded()) === expanded)
      .addOption('selected', options.selected, async (h, selected) => (await h.isSelected()) === selected);
  }

  /** Its own label, without its children's. */
  async getText() {
    return (await (await this.locatorFor(':scope > :first-child')()).text()).trim();
  }
  async getLevel() {
    return Number(await (await this.host()).getAttribute('aria-level'));
  }
  /** Whether it has children to show. */
  async isExpandable() {
    return (await (await this.host()).getAttribute('aria-expanded')) !== null;
  }
  async isExpanded() {
    return (await (await this.host()).getAttribute('aria-expanded')) === 'true';
  }
  async isSelected() {
    return (await (await this.host()).getAttribute('aria-selected')) === 'true';
  }
  async isDisabled() {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }
  async click() {
    return (await this.host()).click();
  }
  /** ArrowRight on the item, as a keyboard user opens it. */
  async expand() {
    if ((await this.isExpandable()) && !(await this.isExpanded())) await this.key(TestKey.RIGHT_ARROW);
  }
  async collapse() {
    if (await this.isExpanded()) await this.key(TestKey.LEFT_ARROW);
  }

  private async key(key: TestKey) {
    const host = await this.host();
    await host.focus();
    await host.sendKeys(key);
  }
}

export class FzTreeHarness extends ComponentHarness {
  static hostSelector = 'fz-tree';

  static with(options: FzTreeHarnessFilters = {}) {
    return new HarnessPredicate(FzTreeHarness, options).addOption('label', options.label, async (h, label) =>
      HarnessPredicate.stringMatches((await h.host()).getAttribute('aria-label'), label),
    );
  }

  /** The items now in the tree (children of a collapsed item are not rendered yet). */
  async getItems(filter: FzTreeItemHarnessFilters = {}) {
    return this.locatorForAll(FzTreeItemHarness.with(filter))();
  }
  async getItem(filter: FzTreeItemHarnessFilters) {
    return this.locatorFor(FzTreeItemHarness.with(filter))();
  }
}
