import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_LIST_GROUP } from './list-group';

@Component({
  imports: [FZ_LIST_GROUP],
  template: `
    <ul fzListGroup><li fzListGroupItem>One</li></ul>
    <div fzListGroup><button fzListGroupItem aria-current="true">Inbox</button><button fzListGroupItem disabled>Archive</button></div>
  `,
})
class Host {}

describe('FzListGroup', () => {
  it('a bordered, divided list; only links and buttons get pointer styles; aria-current marks the row', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('ul')!.classList).toContain('divide-y');
    const li = el.querySelector('li')!;
    expect(li.classList).toContain('[button&]:hover:bg-accent'); // scoped by element, so a plain row never highlights
    expect(li.classList).toContain('aria-[current]:bg-accent');
    const [inbox, archive] = el.querySelectorAll('button');
    expect(inbox.getAttribute('aria-current')).toBe('true');
    expect(archive.disabled).toBe(true);
  });
});
