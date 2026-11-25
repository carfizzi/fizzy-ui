import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo } from '../../src/app/demos/accordion';
import { FzAccordionHarness, FzAccordionItemHarness } from './accordion.harness';

describe('FzAccordionHarness', () => {
  it('lists items, expands and collapses one, reads its content, sees a disabled one', async () => {
    const fixture = TestBed.createComponent(Demo);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const accordion = await loader.getHarness(FzAccordionHarness);
    const items = await accordion.getItems();
    expect(await Promise.all(items.map((i) => i.getTitle()))).toEqual(['Is it accessible?', 'Is it styled?', 'Disabled item']);
    expect(await items[2].isDisabled()).toBe(true);

    const styled = await loader.getHarness(FzAccordionItemHarness.with({ title: /styled/ }));
    expect(await styled.isExpanded()).toBe(false);
    await styled.expand();
    expect(await styled.isExpanded()).toBe(true);
    expect(await styled.getContentText()).toBe('Yes, with Tailwind and CSS variables you own.');
    expect((await accordion.getItems({ expanded: true })).length).toBe(1);
    await styled.collapse();
    expect(await styled.isExpanded()).toBe(false);
  });
});
