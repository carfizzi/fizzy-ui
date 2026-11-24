import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_COLLAPSIBLE } from './collapsible';

@Component({
  imports: [FZ_COLLAPSIBLE],
  template: `
    <div fzCollapsible [(open)]="open" [disabled]="disabled()">
      <button fzCollapsibleTrigger>More</button>
      <fz-collapsible-content><a href="/x">Hidden link</a></fz-collapsible-content>
    </div>
  `,
})
class Host {
  open = signal(false);
  disabled = signal(false);
}

describe('FzCollapsible', () => {
  it('a disclosure: the button toggles aria-expanded and the inert content, [(open)] binds, disabled blocks', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector('button')!;
    const content = el.querySelector<HTMLElement>('fz-collapsible-content')!;
    const stable = () => fixture.whenStable();

    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe(content.id);
    expect(content.inert).toBe(true);

    button.click();
    await stable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(content.inert).toBe(false);
    expect(fixture.componentInstance.open()).toBe(true);

    fixture.componentInstance.open.set(false);
    await stable();
    expect(content.inert).toBe(true);

    fixture.componentInstance.disabled.set(true);
    await stable();
    expect(button.disabled).toBe(true);
    button.click();
    await stable();
    expect(content.inert).toBe(true);
  });
});
