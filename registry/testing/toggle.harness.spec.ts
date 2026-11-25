import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo as ToggleDemo } from '../../src/app/demos/toggle';
import { Demo as ToggleGroupDemo } from '../../src/app/demos/toggle-group';
import { FzToggleGroupHarness, FzToggleHarness } from './toggle.harness';

describe('toggle harnesses', () => {
  it('FzToggleHarness: found by aria-label, toggles, sees a disabled one', async () => {
    const loader = TestbedHarnessEnvironment.loader(TestBed.createComponent(ToggleDemo));
    const bold = await loader.getHarness(FzToggleHarness.with({ text: 'Bold' }));
    expect(await bold.isPressed()).toBe(false);
    await bold.toggle();
    expect(await bold.isPressed()).toBe(true);
    expect(await (await loader.getHarness(FzToggleHarness.with({ text: 'Underline' }))).isDisabled()).toBe(true);
  });

  it('FzToggleGroupHarness: by label, presses items, reads the pressed ones', async () => {
    const loader = TestbedHarnessEnvironment.loader(TestBed.createComponent(ToggleGroupDemo));
    const align = await loader.getHarness(FzToggleGroupHarness.with({ label: 'Alignment' }));
    await align.clickItem({ text: 'Center' });
    expect(await align.getPressedTexts()).toEqual(['Center']);
    const style = await loader.getHarness(FzToggleGroupHarness.with({ label: 'Text style' }));
    expect(await style.getPressedTexts()).toEqual(['Bold']); // the demo starts with bold
    await style.clickItem({ text: 'Italic' });
    expect(await style.getPressedTexts()).toEqual(['Bold', 'Italic']);
    await style.clickItem({ text: 'Bold' });
    expect(await style.getPressedTexts()).toEqual(['Italic']);
    expect(await (await style.getItems({ text: 'Strikethrough' }))[0].isDisabled()).toBe(true);
  });
});
