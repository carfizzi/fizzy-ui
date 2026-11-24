import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzKbd } from './kbd';

@Component({
  imports: [FzKbd],
  template: `<kbd fzKbd id="esc">Esc</kbd><kbd fzKbd id="combo"><kbd fzKbd>Ctrl</kbd>+<kbd fzKbd>K</kbd></kbd>`,
})
class Host {}

describe('FzKbd', () => {
  it('styles a key, and lets a combination only space its keys', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#esc')!.classList).toContain('border');
    const combo = el.querySelector('#combo')!;
    expect(combo.classList).toContain('has-[kbd]:border-0');
    expect(combo.textContent).toBe('Ctrl+K');
    expect(combo.querySelectorAll('kbd').length).toBe(2);
  });
});
