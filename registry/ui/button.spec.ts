import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzButton } from './button';

@Component({
  imports: [FzButton],
  template: `
    <button fzButton>Default</button>
    <button fzButton variant="destructive" size="sm">Delete</button>
    <button fzButton icon size="lg" disabled aria-label="Close">X</button>
    <div data-size="xs"><button fzButton>Inside</button></div>
  `,
})
class Host {}

describe('FzButton', () => {
  it('applies the variant; sizes come from the fizzy.css scale through data-size', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [def, destructive, icon, inside] = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;

    const has = (el: HTMLElement, ...c: string[]) => c.every((x) => el.classList.contains(x));
    expect(has(def, 'bg-primary', 'h-(--fz-h)', 'px-(--fz-px)', 'text-(length:--fz-text)')).toBe(true);
    expect(def.hasAttribute('data-size')).toBe(false); // md from :root, or the nearest container
    expect(has(destructive, 'bg-destructive')).toBe(true);
    expect(destructive.getAttribute('data-size')).toBe('sm');
    expect(destructive.classList.contains('bg-primary')).toBe(false);
    // icon: square (width = height), no padding class to fight with
    expect(has(icon, 'w-(--fz-h)')).toBe(true);
    expect(icon.classList.contains('px-(--fz-px)')).toBe(false);
    expect(icon.getAttribute('data-size')).toBe('lg');
    // a container's data-size reaches the button: it sets none of its own
    expect(inside.hasAttribute('data-size')).toBe(false);
    expect(inside.closest('[data-size]')!.getAttribute('data-size')).toBe('xs');
  });

  it('keeps native disabled', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelectorAll('button')[2] as HTMLButtonElement;
    expect(icon.disabled).toBe(true);
    expect(icon.classList.contains('disabled:opacity-50')).toBe(true);
  });
});
