import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_SWITCH } from './switch';

@Component({
  imports: [FZ_SWITCH],
  template: `<label><input type="checkbox" fzSwitch [checked]="true" (change)="changes = changes + 1" /> Wi-Fi</label>`,
})
class Host {
  changes = 0;
}

describe('FzSwitch', () => {
  it('is a native checkbox with role=switch: checked state and label click', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('role')).toBe('switch');
    expect(input.checked).toBe(true);
    expect(input.classList).toContain('checked:before:translate-x-4');
    fixture.nativeElement.querySelector('label').click();
    expect(input.checked).toBe(false);
    expect(fixture.componentInstance.changes).toBe(1);
  });
});
