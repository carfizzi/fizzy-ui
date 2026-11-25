import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo } from '../../src/app/demos/tabs';
import { FzTabsHarness } from './tabs.harness';

describe('FzTabsHarness', () => {
  it('lists tabs, reads the selected one and its panel, selects another', async () => {
    const fixture = TestBed.createComponent(Demo);
    const tabs = await TestbedHarnessEnvironment.loader(fixture).getHarness(FzTabsHarness);
    const all = await tabs.getTabs();
    expect(await Promise.all(all.map((t) => t.getLabel()))).toEqual(['Account', 'Password', 'Billing']);
    expect(await all[2].isDisabled()).toBe(true);
    expect(await (await tabs.getSelectedTab()).getLabel()).toBe('Account');
    expect(await tabs.getSelectedPanelText()).toBe('Make changes to your account here.');
    await tabs.selectTab({ label: 'Password' });
    expect(await (await tabs.getSelectedTab()).getLabel()).toBe('Password');
    expect(await tabs.getSelectedPanelText()).toBe('Change your password here.');
  });
});
