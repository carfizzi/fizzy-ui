import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { FZ_MULTISELECT, FZ_SELECT } from '../ui/select';
import { FzMultiselectHarness, FzSelectHarness } from './select.harness';

@Component({
  imports: [FZ_SELECT, FZ_MULTISELECT],
  template: `
    <span id="fruit-label">Fruit</span>
    <fz-select [(value)]="fruit" aria-labelledby="fruit-label" placeholder="Pick one">
      <fz-select-item value="apple" label="Apple" />
      <fz-select-item value="kiwi" label="Kiwi" />
      <fz-select-item value="durian" label="Durian" disabled />
    </fz-select>
    <fz-select aria-label="Plan" [disabled]="true"><fz-select-item value="free" label="Free" /></fz-select>
    <fz-multiselect [(value)]="extras" aria-label="Extras">
      <fz-select-item value="milk" label="Milk" />
      <fz-select-item value="sugar" label="Sugar" />
    </fz-multiselect>
  `,
})
class Host {
  fruit = signal<string | undefined>(undefined);
  extras = signal<string[]>([]);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  return { fixture, loader: TestbedHarnessEnvironment.loader(fixture) };
}

describe('FzSelectHarness', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('finds a select by label, reads its options and picks one', async () => {
    const { fixture, loader } = await setup();
    const select = await loader.getHarness(FzSelectHarness.with({ label: 'Fruit' }));
    expect(await select.getValueText()).toBe('');
    expect(await select.getPlaceholder()).toBe('Pick one');
    expect(await select.isOpen()).toBe(false);

    const options = await select.getOptions();
    expect(await select.isOpen()).toBe(true);
    expect(await Promise.all(options.map((o) => o.getText()))).toEqual(['Apple', 'Kiwi', 'Durian']);
    expect(await options[2].isDisabled()).toBe(true);

    await select.clickOptions({ text: 'Kiwi' });
    expect(fixture.componentInstance.fruit()).toBe('kiwi');
    expect(await select.getValueText()).toBe('Kiwi');
    expect(await select.isOpen()).toBe(false);
  });

  it('a disabled select, and the multiselect toggling options', async () => {
    const { fixture, loader } = await setup();
    expect(await (await loader.getHarness(FzSelectHarness.with({ label: 'Plan' }))).isDisabled()).toBe(true);
    const extras = await loader.getHarness(FzMultiselectHarness);
    await extras.clickOptions({ text: /Milk|Sugar/ });
    expect(fixture.componentInstance.extras()).toEqual(['milk', 'sugar']);
    expect(await extras.getValueText()).toBe('Milk, Sugar');
    expect((await extras.getOptions({ selected: true })).length).toBe(2);
    await extras.close();
    expect(await extras.isOpen()).toBe(false);
  });
});
