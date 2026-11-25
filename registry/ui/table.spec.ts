import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_TABLE, FzSort } from './table';

@Component({
  imports: [FZ_TABLE],
  template: `
    <table fzTable [(sort)]="sort">
      <thead><tr><th fzSortHeader="name">Name</th><th fzSortHeader="age">Age</th><th>Note</th></tr></thead>
      <tbody><tr><td>Ada</td><td>36</td><td></td></tr></tbody>
    </table>
  `,
})
class Host {
  sort = signal<FzSort | undefined>({ column: 'age', direction: 'descending' });
}

describe('FzTable', () => {
  it('sort headers hold a button; aria-sort only on the sorted column; clicks cycle asc → desc → none', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const [name, age, note] = el.querySelectorAll<HTMLElement>('th');
    const sorts = () => [name, age, note].map((th) => th.getAttribute('aria-sort'));
    expect(el.querySelector('table')!.classList).toContain('[&_th]:text-start');
    expect(name.querySelector('button')!.textContent!.trim()).toBe('Name');
    expect(note.querySelector('button')).toBeNull();
    expect(sorts()).toEqual([null, 'descending', null]);

    const click = async (th: HTMLElement) => (th.querySelector('button')!.click(), await fixture.whenStable());
    await click(name);
    expect(fixture.componentInstance.sort()).toEqual({ column: 'name', direction: 'ascending' });
    expect(sorts()).toEqual(['ascending', null, null]);
    await click(name);
    expect(sorts()).toEqual(['descending', null, null]);
    await click(name);
    expect(fixture.componentInstance.sort()).toBeUndefined();
    expect(sorts()).toEqual([null, null, null]);
  });
});
