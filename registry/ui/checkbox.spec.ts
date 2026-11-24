import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FZ_CHECKBOX } from './checkbox';

@Component({
  imports: [FZ_CHECKBOX, FormsModule],
  template: `
    <label><input type="checkbox" fzCheckbox [(ngModel)]="terms" /> Accept terms</label>
    <input type="checkbox" fzCheckbox aria-label="All" [indeterminate]="some()" />
    <input type="checkbox" fzCheckbox aria-label="Off" disabled />
  `,
})
class Host {
  terms = signal(false);
  some = signal(true);
}

describe('FzCheckbox', () => {
  it('is a native checkbox: label click toggles, ngModel binds, indeterminate is native', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [terms, all, off] = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    expect(terms.classList).toContain('checked:bg-primary');
    expect(terms.classList).toContain('focus-visible:ring-ring');
    expect(terms.classList).toContain('motion-reduce:before:scale-100'); // Reduce Motion: the mark only fades

    fixture.nativeElement.querySelector('label').click();
    await fixture.whenStable();
    expect(terms.checked).toBe(true);
    expect(fixture.componentInstance.terms()).toBe(true);
    fixture.componentInstance.terms.set(false);
    await fixture.whenStable();
    expect(terms.checked).toBe(false);

    expect(all.indeterminate).toBe(true);
    expect(all.matches(':indeterminate')).toBe(true);
    all.click(); // a click resolves the mixed state
    expect(all.indeterminate).toBe(false);
    expect(all.checked).toBe(true);

    off.click();
    expect(off.checked).toBe(false);
  });
});
