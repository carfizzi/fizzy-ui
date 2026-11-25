import { BaseHarnessFilters, ComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';

/**
 * Test harnesses for `fz-calendar` and `fz-date-picker` (Angular CDK testing). Dates are local days:
 * pass a `Date` or `'2026-03-12'`. `await picker.selectDate(new Date(2026, 2, 12))` opens it, moves
 * to that month and clicks the day.
 */

type Day = Date | string;
const iso = (d: Day) =>
  typeof d === 'string' ? d : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export class FzCalendarHarness extends ComponentHarness {
  static hostSelector = 'fz-calendar';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzCalendarHarness, options);
  }

  private readonly prev = this.locatorFor('button[aria-label="Previous month"]');
  private readonly next = this.locatorFor('button[aria-label="Next month"]');

  /** The shown month, as the heading reads it ("March 2026"). */
  async getMonthLabel() {
    return (await (await this.locatorFor('h2')()).text()).trim();
  }
  /** The picked day as `yyyy-mm-dd`, or null. */
  async getSelectedDate() {
    return (await (await this.locatorForOptional('td[aria-selected=true]')())?.getAttribute('data-date')) ?? null;
  }
  async isDisabled() {
    return (await (await this.locatorFor('[role=grid]')()).getAttribute('aria-disabled')) === 'true';
  }
  /** Whether a day of the shown month cannot be picked (outside min/max, or `dateDisabled`). */
  async isDateDisabled(day: Day) {
    return (await (await this.cell(day)).getAttribute('aria-disabled')) === 'true';
  }
  async previousMonth() {
    await (await this.prev()).click();
  }
  async nextMonth() {
    await (await this.next()).click();
  }
  /** Moves to the day's month with the month buttons, then clicks the day. */
  async selectDate(day: Day) {
    const target = iso(day);
    for (let i = 0; i < 240 && !(await this.locatorForOptional(`td[data-date="${target}"]`)()); i++) {
      const shown = (await (await this.locatorFor('td[data-date]')()).getAttribute('data-date'))!.slice(0, 7);
      const button = target.slice(0, 7) < shown ? await this.prev() : await this.next();
      if ((await button.getAttribute('aria-disabled')) === 'true') break;
      await button.click();
    }
    await (await this.cell(target)).click();
  }

  private async cell(day: Day) {
    const cell = await this.locatorForOptional(`td[data-date="${iso(day)}"]`)();
    if (!cell) throw new Error(`${iso(day)} is not in the shown month (${await this.getMonthLabel()})`);
    return cell;
  }
}

export class FzDatePickerHarness extends ComponentHarness {
  static hostSelector = 'fz-date-picker';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzDatePickerHarness, options);
  }

  private readonly button = this.locatorFor('button[aria-haspopup]');
  private readonly document = this.documentRootLocatorFactory();

  /** The button's text: the picked date as shown, or the placeholder. */
  async getValueText() {
    return (await (await this.button()).text()).trim();
  }
  async isDisabled() {
    return (await this.button()).getProperty<boolean>('disabled');
  }
  async isOpen() {
    return (await (await this.button()).getAttribute('aria-expanded')) === 'true';
  }
  async open() {
    if (!(await this.isOpen())) await (await this.button()).click();
  }
  /** Escape, from the calendar: focus goes back to the button. */
  async close() {
    if (await this.isOpen()) await (await this.popup()).sendKeys(TestKey.ESCAPE);
  }
  /** Opens it and returns its calendar. */
  async getCalendar() {
    await this.open();
    const id = await (await this.button()).getAttribute('aria-controls');
    return this.document.locatorFor(FzCalendarHarness.with({ ancestor: `[id="${id}"]` }))();
  }
  async selectDate(day: Day) {
    await (await this.getCalendar()).selectDate(day);
  }

  private async popup() {
    return this.document.locatorFor(`[id="${await (await this.button()).getAttribute('aria-controls')}"]`)();
  }
}
