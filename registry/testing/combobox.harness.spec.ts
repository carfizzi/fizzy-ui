import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo } from '../../src/app/demos/combobox';
import { FzComboboxHarness } from './combobox.harness';

describe('FzComboboxHarness', () => {
  it('finds it by its <label for>, types to filter, picks an option', async () => {
    const fixture = TestBed.createComponent(Demo);
    document.body.appendChild(fixture.nativeElement);
    const country = await TestbedHarnessEnvironment.loader(fixture).getHarness(FzComboboxHarness.with({ label: 'Country' }));
    expect(await country.getValue()).toBe('');
    await country.setValue('ger');
    expect(await country.isOpen()).toBe(true);
    const options = await country.getOptions();
    expect(await Promise.all(options.map((o) => o.getText()))).toEqual(['Germany']);
    await country.selectOption({ text: 'Germany' });
    expect(await country.getValue()).toBe('Germany');
    expect(await country.isOpen()).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Value: Germany');
    document.body.innerHTML = '';
  });
});
