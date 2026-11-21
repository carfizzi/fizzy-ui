import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_RADIO_GROUP } from './radio-group';

@Component({
  imports: [FZ_RADIO_GROUP],
  template: `
    <div fzRadioGroup aria-label="Plan">
      @for (p of plans; track p) {
        <label><input type="radio" fzRadio name="plan" [value]="p" [checked]="plan() === p" (change)="plan.set(p)" /> {{ p }}</label>
      }
    </div>
  `,
})
class Host {
  plans = ['free', 'pro', 'team'];
  plan = signal('free');
}

describe('FzRadioGroup', () => {
  it('is a radiogroup of native radios holding one value', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[fzRadioGroup]')!.getAttribute('role')).toBe('radiogroup');
    const radios = [...el.querySelectorAll<HTMLInputElement>('input')];
    expect(radios.map((r) => r.checked)).toEqual([true, false, false]);
    expect(radios[0].classList).toContain('checked:before:scale-100');

    el.querySelectorAll('label')[2].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.plan()).toBe('team');
    expect(radios.map((r) => r.checked)).toEqual([false, false, true]);
    radios[1].click();
    expect(radios.map((r) => r.checked)).toEqual([false, true, false]);
  });
});
