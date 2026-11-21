import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_TABS } from './tabs';

@Component({
  imports: [FZ_TABS],
  template: `
    <div fzTabs>
      <ul fzTabList [(selectedTab)]="tab">
        <li fzTab value="a">A</li>
        <li fzTab value="b">B</li>
        <li fzTab value="c" disabled>C</li>
      </ul>
      <div fzTabPanel value="a"><ng-template ngTabContent>Panel A</ng-template></div>
      <div fzTabPanel value="b"><ng-template ngTabContent>Panel B</ng-template></div>
      <div fzTabPanel value="c"><ng-template ngTabContent>Panel C</ng-template></div>
    </div>
  `,
})
class Host {
  tab = signal<string | undefined>('a');
}

const key = (el: HTMLElement, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const tabs = [...el.querySelectorAll<HTMLElement>('[fzTab]')];
  const panels = [...el.querySelectorAll<HTMLElement>('[fzTabPanel]')];
  return { fixture, tabs, panels, selected: () => tabs.map((t) => t.getAttribute('aria-selected')) };
}

describe('FzTabs', () => {
  it('click selects the tab, updates selectedTab and shows its panel', async () => {
    const { fixture, tabs, panels, selected } = await setup();
    expect(selected()).toEqual(['true', 'false', 'false']);
    expect(panels[1].hasAttribute('inert')).toBe(true);

    tabs[1].click();
    await fixture.whenStable();
    expect(selected()).toEqual(['false', 'true', 'false']);
    expect(fixture.componentInstance.tab()).toBe('b');
    expect(panels[1].hasAttribute('inert')).toBe(false);
    expect(panels[1].textContent).toContain('Panel B');
    expect(panels[0].hasAttribute('inert')).toBe(true);
  });

  it('arrow keys move the selection', async () => {
    const { fixture, tabs } = await setup();
    tabs[0].focus();
    key(tabs[0], 'ArrowRight');
    await fixture.whenStable();
    expect(fixture.componentInstance.tab()).toBe('b');

    key(tabs[1], 'ArrowLeft');
    await fixture.whenStable();
    expect(fixture.componentInstance.tab()).toBe('a');
  });

  it('Home and End jump to the first and last tab', async () => {
    const { fixture, tabs } = await setup();
    tabs[0].focus();
    key(tabs[0], 'End');
    await fixture.whenStable();
    // softDisabled (Aria default): focus reaches the disabled last tab, selection does not.
    expect(document.activeElement).toBe(tabs[2]);
    expect(fixture.componentInstance.tab()).not.toBe('c');
    key(document.activeElement as HTMLElement, 'Home');
    await fixture.whenStable();
    expect(fixture.componentInstance.tab()).toBe('a');
  });

  it('never selects the disabled tab', async () => {
    const { fixture, tabs } = await setup();
    expect(tabs[2].getAttribute('aria-disabled')).toBe('true');

    tabs[2].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.tab()).toBe('a');

    tabs[1].click();
    await fixture.whenStable();
    key(tabs[1], 'ArrowRight');
    await fixture.whenStable();
    expect(fixture.componentInstance.tab()).not.toBe('c');
    expect(tabs[2].getAttribute('aria-selected')).toBe('false');
  });
});
