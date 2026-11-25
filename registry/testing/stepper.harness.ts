import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Test harness for `fz-stepper` (Angular CDK testing):
 * `await (await stepper.getCurrentStep()).getLabel()`, `await stepper.selectStep({ label: 'Payment' })`.
 */

export interface FzStepHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
  current?: boolean;
  completed?: boolean;
}

export class FzStepHarness extends ComponentHarness {
  /** A step's header button in the stepper's list. */
  static hostSelector = 'ol > li > button';

  static with(options: FzStepHarnessFilters = {}) {
    return new HarnessPredicate(FzStepHarness, options)
      .addOption('label', options.label, (h, label) => HarnessPredicate.stringMatches(h.getLabel(), label))
      .addOption('current', options.current, async (h, current) => (await h.isCurrent()) === current)
      .addOption('completed', options.completed, async (h, completed) => (await h.isCompleted()) === completed);
  }

  private readonly spans = this.locatorForAll('span');

  async getLabel() {
    // number, "Step i of n:", label, ", completed"
    return (await (await this.spans())[2].text()).trim();
  }
  async isCurrent() {
    return (await (await this.host()).getAttribute('aria-current')) === 'step';
  }
  async isCompleted() {
    return (await (await this.host()).text()).includes(', completed');
  }
  /** A linear stepper keeps steps after the first unfinished one shut. */
  async isDisabled() {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }
  async select() {
    return (await this.host()).click();
  }
}

export class FzStepperHarness extends ComponentHarness {
  static hostSelector = 'fz-stepper';

  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(FzStepperHarness, options);
  }

  async getSteps(filter: FzStepHarnessFilters = {}) {
    return this.locatorForAll(FzStepHarness.with(filter))();
  }
  async getCurrentStep() {
    return this.locatorFor(FzStepHarness.with({ current: true }))();
  }
  async selectStep(filter: FzStepHarnessFilters) {
    const [step] = await this.getSteps(filter);
    if (!step) throw new Error(`no step matches ${JSON.stringify(filter)}`);
    await step.select();
  }
}
