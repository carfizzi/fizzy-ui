import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_SLIDER } from './slider';

@Component({
  imports: [FZ_SLIDER],
  template: `<input type="range" fzSlider aria-label="Volume" min="10" max="60" [value]="volume()" (input)="volume.set(+$any($event.target).value)" />`,
})
class Host {
  volume = signal(35);
}

describe('FzSlider', () => {
  it('is a native range whose fill follows the value, from input and from bindings', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const fill = () => input.style.getPropertyValue('--fz-fill');
    expect(input.type).toBe('range');
    expect(fill()).toBe('50%');

    input.value = '60';
    input.dispatchEvent(new Event('input'));
    expect(fill()).toBe('100%');
    expect(fixture.componentInstance.volume()).toBe(60);

    fixture.componentInstance.volume.set(10);
    await fixture.whenStable();
    expect(input.value).toBe('10');
    expect(fill()).toBe('0%');
  });
});
