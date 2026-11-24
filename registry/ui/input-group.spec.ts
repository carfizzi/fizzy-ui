import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_INPUT_GROUP } from './input-group';

@Component({
  imports: [FZ_INPUT_GROUP],
  template: `<div fzInputGroup><span fzInputGroupAddon>https://</span><input fzInputGroupInput aria-label="Site" /></div>`,
})
class Host {}

describe('FzInputGroup', () => {
  it('the border, ring and invalid state live on the group; the input is bare', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const group = el.querySelector<HTMLElement>('[fzInputGroup]')!;
    expect(group.classList).toContain('focus-within:ring-2');
    expect(group.classList).toContain('has-[[aria-invalid=true]]:border-destructive');
    expect(el.querySelector('[fzInputGroupAddon]')!.classList).toContain('text-muted-foreground');
    const input = el.querySelector('input')!;
    expect(input.classList).toContain('bg-transparent');
    expect(input.classList).toContain('not-first:pl-0');
    expect(input.classList).not.toContain('border');
  });
});
