import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_GRID } from './grid';

@Component({
  imports: [FZ_GRID],
  template: `
    <table fzGrid aria-label="People" [enableSelection]="true" selectionMode="explicit">
      <tr fzGridRow>
        <th fzGridCell role="columnheader" data-c="h-name">Name</th>
        <th fzGridCell role="columnheader" data-c="h-role">Role</th>
        <th fzGridCell role="columnheader" data-c="h-city">City</th>
      </tr>
      <tr fzGridRow>
        <td fzGridCell data-c="ada" [(selected)]="adaSelected">Ada</td>
        <td fzGridCell data-c="ada-role">Engineer</td>
        <td fzGridCell data-c="ada-city">
          <input fzGridCellInput widgetType="editable" aria-label="Ada's city" [value]="city()" (input)="city.set($any($event.target).value)" />
        </td>
      </tr>
      <tr fzGridRow>
        <td fzGridCell data-c="alan">Alan</td>
        <td fzGridCell data-c="alan-role" [disabled]="true">Locked</td>
        <td fzGridCell data-c="alan-city">Wilmslow</td>
      </tr>
    </table>
  `,
})
class Host {
  adaSelected = signal(false);
  city = signal('London');
}

const key = (k: string, init: KeyboardEventInit = {}) =>
  document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const cell = (name: string) => el.querySelector<HTMLElement>(`[data-c=${name}]`)!;
  const input = el.querySelector<HTMLInputElement>('input')!;
  const stable = () => fixture.whenStable();
  const press = async (k: string, init?: KeyboardEventInit) => (key(k, init), await stable());
  return { fixture, el, cell, input, stable, press, host: fixture.componentInstance };
}

describe('FzGrid', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('has grid, row, columnheader and gridcell roles with one Tab stop', async () => {
    const { el, cell, input } = await setup();
    expect(el.querySelector('table')!.getAttribute('role')).toBe('grid');
    expect([...el.querySelectorAll('tr')].every((r) => r.getAttribute('role') === 'row')).toBe(true);
    expect(cell('h-name').getAttribute('role')).toBe('columnheader');
    expect(cell('ada').getAttribute('role')).toBe('gridcell');
    const tabbable = [...el.querySelectorAll<HTMLElement>('th, td, input')].filter((c) => c.tabIndex === 0);
    expect(tabbable).toEqual([cell('h-name')]);
    expect(input.tabIndex).toBe(-1);
  });

  it('arrows move between cells (looping), Home/End in the row, Ctrl+Home/End in the grid', async () => {
    const { cell, press } = await setup();
    cell('h-name').focus();
    await press('ArrowDown');
    expect(document.activeElement).toBe(cell('ada'));
    await press('ArrowRight');
    expect(document.activeElement).toBe(cell('ada-role'));
    await press('ArrowDown');
    expect(document.activeElement).toBe(cell('alan-role')); // disabled cells are focusable (soft)
    expect(cell('alan-role').getAttribute('aria-disabled')).toBe('true');
    await press('ArrowDown');
    expect(document.activeElement).toBe(cell('h-role')); // rows loop
    await press('End');
    expect(document.activeElement).toBe(cell('h-city'));
    await press('Home');
    expect(document.activeElement).toBe(cell('h-name'));
    await press('End', { ctrlKey: true });
    expect(document.activeElement).toBe(cell('alan-city'));
    await press('Home', { ctrlKey: true });
    expect(document.activeElement).toBe(cell('h-name'));
  });

  it('Space selects a cell (single), [(selected)] follows, disabled cells are never selected', async () => {
    const { cell, press, host } = await setup();
    cell('ada').focus();
    await press(' ');
    expect(host.adaSelected()).toBe(true);
    expect(cell('ada').getAttribute('aria-selected')).toBe('true');
    await press('ArrowRight');
    await press(' ');
    expect(cell('ada-role').getAttribute('aria-selected')).toBe('true');
    expect(host.adaSelected()).toBe(false);
    await press('ArrowDown');
    await press(' ');
    expect(cell('alan-role').getAttribute('aria-selected')).not.toBe('true');
  });

  it('editable cell: the input takes the cell focus; Enter edits (grid keys pause), Enter/Escape stop', async () => {
    const { cell, input, press, host } = await setup();
    cell('ada-role').focus();
    await press('ArrowRight');
    expect(document.activeElement).toBe(input); // a cell with a widget focuses the widget
    expect(input.getAttribute('data-active-control')).toBe('cell');
    await press('Enter');
    expect(input.getAttribute('data-active-control')).toBe('widget');
    await press('ArrowLeft'); // moves the caret, not the grid
    expect(document.activeElement).toBe(input);
    input.value = 'Paris';
    input.dispatchEvent(new Event('input'));
    await press('Enter');
    expect(input.getAttribute('data-active-control')).toBe('cell');
    expect(host.city()).toBe('Paris');

    await press('a'); // typing starts editing too
    expect(input.getAttribute('data-active-control')).toBe('widget');
    await press('Escape');
    expect(input.getAttribute('data-active-control')).toBe('cell');
    expect(document.activeElement).toBe(input);
    await press('ArrowLeft');
    expect(document.activeElement).toBe(cell('ada-role'));
  });
});
