import { TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import { App } from './app';

// Runs axe on every playground example. color-contrast is off: jsdom has no layout or computed colors.
async function violations(root: HTMLElement) {
  const { violations } = await axe.run(root, { rules: { 'color-contrast': { enabled: false } } });
  return violations.map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`);
}

describe('playground accessibility (axe)', () => {
  it('has no violations in the initial state', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(await violations(fixture.nativeElement)).toEqual([]);
  });

  it('has no violations with panels opened', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    el.querySelector<HTMLElement>('[ngAccordionTrigger]')!.click();
    el.querySelectorAll<HTMLElement>('[fzTab]')[1].click();
    el.querySelector<HTMLElement>('fz-select')!.click();
    el.querySelector<HTMLElement>('fz-multiselect')!.click();
    el.querySelector<HTMLElement>('input[fzCombobox]')!.click();
    [...el.querySelectorAll<HTMLElement>('[role=treeitem]')].find((i) => i.textContent!.trim().startsWith('registry'))!.click();
    await fixture.whenStable();
    expect(await violations(el)).toEqual([]);
  });
});
