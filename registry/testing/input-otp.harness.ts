import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harness for `fz-input-otp` (Angular CDK testing): one real input under the boxes, so typing and
 * pasting work as in a text field. `await (await loader.getHarness(FzInputOtpHarness)).setValue('123456')`.
 */
export class FzInputOtpHarness extends ComponentHarness {
  static hostSelector = 'fz-input-otp';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzInputOtpHarness, options);
  }

  private readonly input = this.locatorFor('input');

  async getValue() {
    return (await this.input()).getProperty<string>('value');
  }
  /** Replaces the code as typed; characters outside the `charset` are dropped, as for a user. */
  async setValue(code: string) {
    const input = await this.input();
    await input.clear();
    if (code) await input.setInputValue(code);
    await input.dispatchEvent('input');
  }
  /** How many boxes it draws (its `length`). */
  async getLength() {
    return (await this.locatorForAll('[aria-hidden=true] > div')()).length;
  }
  async isDisabled() {
    return (await this.input()).getProperty<boolean>('disabled');
  }
  async blur() {
    await (await this.input()).blur();
  }
}
