import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzButton } from './button';

@Component({
  imports: [FzButton],
  template: `
    <button fzButton>Default</button>
    <button fzButton variant="destructive" size="sm">Delete</button>
    <button fzButton size="icon" disabled>X</button>
  `,
})
class Host {}

describe('FzButton', () => {
  it('applies variant and size classes', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [def, destructive, icon] = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;

    const has = (el: HTMLElement, ...c: string[]) => c.every((x) => el.classList.contains(x));
    expect(has(def, 'bg-primary', 'h-9', 'px-4')).toBe(true);
    expect(has(destructive, 'bg-destructive', 'h-8', 'px-3')).toBe(true);
    expect(destructive.classList.contains('bg-primary')).toBe(false);
    expect(has(icon, 'size-9')).toBe(true);
  });

  it('keeps native disabled', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelectorAll('button')[2] as HTMLButtonElement;
    expect(icon.disabled).toBe(true);
    expect(icon.classList.contains('disabled:opacity-50')).toBe(true);
  });
});
