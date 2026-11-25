import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harness for `table[fzGrid]` (Angular CDK testing):
 * `const team = await loader.getHarness(FzGridHarness.with({ label: 'Team' }));`
 * `await team.getCellTexts()` (rows of cell texts), `await (await team.getCell(1, 0)).click()`.
 */

export interface FzGridHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
}

export class FzGridCellHarness extends ComponentHarness {
  static hostSelector = '[role=gridcell], [role=columnheader], [role=rowheader]';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzGridCellHarness, options);
  }

  /** Its text, or the value of the input it holds (an editable cell). */
  async getText() {
    const input = await this.locatorForOptional('input, textarea')();
    return input ? input.getProperty<string>('value') : (await (await this.host()).text()).trim();
  }
  async isSelected() {
    return (await (await this.host()).getAttribute('aria-selected')) === 'true';
  }
  async isDisabled() {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }
  async isHeader() {
    return (await (await this.host()).getAttribute('role')) !== 'gridcell';
  }
  async click() {
    return (await this.host()).click();
  }
  /** Types into the cell's input (an editable cell) and commits it with a change event. */
  async setInputValue(value: string) {
    const input = await this.locatorFor('input, textarea')();
    await input.clear();
    await input.sendKeys(value);
    await input.dispatchEvent('change');
  }
}

export class FzGridHarness extends ComponentHarness {
  static hostSelector = 'table[fzGrid]';

  static with(options: FzGridHarnessFilters = {}) {
    return new HarnessPredicate(FzGridHarness, options).addOption('label', options.label, async (h, label) =>
      HarnessPredicate.stringMatches((await h.host()).getAttribute('aria-label'), label),
    );
  }

  /** Every row's cells, the header row included. */
  async getRows() {
    const rows = await this.locatorForAll('[role=row]')();
    return Promise.all(rows.map((_, i) => this.locatorForAll(FzGridCellHarness.with({ ancestor: `[role=row]:nth-of-type(${i + 1})` }))()));
  }
  async getCellTexts() {
    return Promise.all((await this.getRows()).map((cells) => Promise.all(cells.map((c) => c.getText()))));
  }
  /** The cell at a row and column, counting the header row as 0. */
  async getCell(row: number, column: number) {
    const cell = (await this.getRows())[row]?.[column];
    if (!cell) throw new Error(`no cell at row ${row}, column ${column}`);
    return cell;
  }
}
