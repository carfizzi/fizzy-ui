import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo } from '../../src/app/demos/chips';
import { FzChipInputHarness, FzChipListboxHarness } from './chips.harness';

describe('chips harnesses', () => {
  it('FzChipListboxHarness: by label, toggles chips, reads the selection and a disabled chip', async () => {
    const fixture = TestBed.createComponent(Demo);
    const diet = await TestbedHarnessEnvironment.loader(fixture).getHarness(FzChipListboxHarness.with({ label: 'Diet' }));
    const before = await diet.getSelectedTexts();
    await diet.toggleChips({ text: 'Gluten-free' });
    expect(await diet.getSelectedTexts()).toEqual([...before, 'Gluten-free'].sort((a, b) => ['Vegetarian', 'Vegan', 'Gluten-free'].indexOf(a) - ['Vegetarian', 'Vegan', 'Gluten-free'].indexOf(b)));
    expect(await (await diet.getChips({ text: 'Halal' }))[0].isDisabled()).toBe(true);
  });

  it('FzChipInputHarness: adds and removes tags', async () => {
    const fixture = TestBed.createComponent(Demo);
    const tags = await TestbedHarnessEnvironment.loader(fixture).getHarness(FzChipInputHarness);
    const before = await tags.getTags();
    await tags.addTag('urgent');
    expect(await tags.getTags()).toEqual([...before, 'urgent']);
    await tags.removeTag('urgent');
    expect(await tags.getTags()).toEqual(before);
  });
});
