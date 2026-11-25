import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo as ListboxDemo } from '../../src/app/demos/listbox';
import { Demo as ToolbarDemo } from '../../src/app/demos/toolbar';
import { Demo as TreeDemo } from '../../src/app/demos/tree';
import { Demo as GridDemo } from '../../src/app/demos/grid';
import { Demo as CollapsibleDemo } from '../../src/app/demos/collapsible';
import { Demo as CommandDemo } from '../../src/app/demos/command';
import { Demo as StepperDemo } from '../../src/app/demos/stepper';
import { Demo as NavigationMenuDemo } from '../../src/app/demos/navigation-menu';
import { Demo as SidebarDemo } from '../../src/app/demos/sidebar';
import { FzListboxHarness } from './listbox.harness';
import { FzToolbarHarness } from './toolbar.harness';
import { FzTreeHarness } from './tree.harness';
import { FzGridHarness } from './grid.harness';
import { FzCollapsibleHarness } from './collapsible.harness';
import { FzCommandHarness } from './command.harness';
import { FzStepperHarness } from './stepper.harness';
import { FzNavigationMenuHarness } from './navigation-menu.harness';
import { FzSidebarHarness } from './sidebar.harness';

// One spec for the harnesses of the composite widgets, each against its docs demo.
function load<T>(demo: Type<T>) {
  const fixture = TestBed.createComponent(demo);
  document.body.appendChild(fixture.nativeElement);
  return { fixture, text: () => (fixture.nativeElement as HTMLElement).textContent!, loader: TestbedHarnessEnvironment.loader(fixture) };
}

describe('composite widget harnesses', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('FzListboxHarness', async () => {
    const { loader } = load(ListboxDemo);
    const fruits = await loader.getHarness(FzListboxHarness.with({ label: 'Fruits' }));
    expect(await fruits.isMultiple()).toBe(true);
    expect(await fruits.getSelectedTexts()).toEqual(['apple']);
    await fruits.selectOptions({ text: 'cherry' });
    expect(await fruits.getSelectedTexts()).toEqual(['apple', 'cherry']);
  });

  it('FzToolbarHarness', async () => {
    const { loader } = load(ToolbarDemo);
    const bar = await loader.getHarness(FzToolbarHarness.with({ label: 'Text formatting' }));
    await bar.clickItem({ text: 'Bold' });
    expect(await Promise.all((await bar.getItems({ pressed: true })).map((i) => i.getText()))).toContain('Bold');
    expect(await (await bar.getItems({ text: 'Share' }))[0].isDisabled()).toBe(true);
  });

  it('FzTreeHarness', async () => {
    const { loader } = load(TreeDemo);
    const tree = await loader.getHarness(FzTreeHarness.with({ label: 'Project files' }));
    const src = await tree.getItem({ text: 'src' });
    expect(await src.isExpanded()).toBe(true);
    expect(await Promise.all((await tree.getItems({ level: 2 })).map((i) => i.getText()))).toEqual(['app', 'main.ts']);
    const registry = await tree.getItem({ text: 'registry' });
    expect(await registry.isExpandable()).toBe(true);
    await registry.expand();
    expect(await registry.isExpanded()).toBe(true);
    expect(await (await tree.getItem({ text: 'registry.json' })).getLevel()).toBe(2);
    await registry.collapse();
    expect(await registry.isExpanded()).toBe(false);
    expect(await (await tree.getItem({ text: /secrets/ })).isDisabled()).toBe(true);
    const main = await tree.getItem({ text: 'main.ts' });
    await main.click();
    expect(await main.isSelected()).toBe(true);
  });

  it('FzGridHarness', async () => {
    const { loader, text } = load(GridDemo);
    const team = await loader.getHarness(FzGridHarness.with({ label: 'Team' }));
    expect(await team.getCellTexts()).toEqual([
      ['Name', 'Role', 'City (editable)'],
      ['Ada', 'Engineer', 'London'],
      ['Grace', 'Admiral', 'Arlington'],
      ['Alan', 'Retired', 'Wilmslow'],
    ]);
    expect(await (await team.getCell(0, 0)).isHeader()).toBe(true);
    expect(await (await team.getCell(3, 1)).isDisabled()).toBe(true);
    await (await team.getCell(1, 2)).setInputValue('Paris');
    expect(text()).toContain('Cities: Paris, Arlington, Wilmslow');
  });

  it('FzCollapsibleHarness', async () => {
    const { loader } = load(CollapsibleDemo);
    const section = await loader.getHarness(FzCollapsibleHarness);
    expect(await section.isOpen()).toBe(false);
    expect(await section.getContentText()).toBe('');
    await section.open();
    expect(await section.getContentText()).toContain('angular/components');
    await section.close();
    expect(await section.isOpen()).toBe(false);
  });

  it('FzCommandHarness', async () => {
    const { loader, text } = load(CommandDemo);
    const palette = await loader.getHarness(FzCommandHarness);
    expect(await palette.getGroupHeadings()).toEqual(['Suggestions', 'Settings']);
    expect(await (await palette.getItems({ text: 'Profile' }))[0].getShortcut()).toBe('⌘P');
    await palette.search('sched');
    expect(await palette.getItemTexts()).toEqual(['Calendar']);
    await palette.selectItem({ text: 'Calendar' });
    expect(text()).toContain('Last command: calendar');
  });

  it('FzStepperHarness', async () => {
    const { fixture, loader } = load(StepperDemo);
    const stepper = await loader.getHarness(FzStepperHarness);
    expect(await Promise.all((await stepper.getSteps()).map((s) => s.getLabel()))).toEqual(['Shipping', 'Payment', 'Review']);
    expect(await (await stepper.getCurrentStep()).getLabel()).toBe('Shipping');
    expect(await (await stepper.getSteps({ label: 'Review' }))[0].isDisabled()).toBe(true); // linear
    const name = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#ship-name')!;
    name.value = 'Ada';
    name.dispatchEvent(new Event('input'));
    await stepper.selectStep({ label: 'Payment' });
    expect(await (await stepper.getCurrentStep()).getLabel()).toBe('Payment');
    expect(await (await stepper.getSteps({ label: 'Shipping' }))[0].isCompleted()).toBe(true);
  });

  it('FzNavigationMenuHarness', async () => {
    const { loader } = load(NavigationMenuDemo);
    const nav = await loader.getHarness(FzNavigationMenuHarness.with({ label: 'Example' }));
    expect(await nav.getTriggerTexts()).toEqual(['Getting started', 'Components']);
    expect(await nav.getOpenItem()).toBeNull();
    expect(await nav.getLinkTexts('Components')).toEqual(['Dialog', 'Menu', 'Select', 'Tabs']);
    expect(await nav.getOpenItem()).toBe('Components');
    await nav.close();
    expect(await nav.getOpenItem()).toBeNull();
  });

  it('FzSidebarHarness', async () => {
    const { loader, text } = load(SidebarDemo);
    const layout = await loader.getHarness(FzSidebarHarness);
    expect(await layout.getCurrentItemText()).toBe('Dashboard');
    await layout.clickItem({ text: 'Team' });
    expect(await layout.getCurrentItemText()).toBe('Team');
    expect(text()).toContain('The team page.');
    const open = await layout.isOpen();
    await layout.toggle();
    expect(await layout.isOpen()).toBe(!open);
  });
});
