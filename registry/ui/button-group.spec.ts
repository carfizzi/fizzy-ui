import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzButtonGroup } from './button-group';

@Component({
  imports: [FzButtonGroup],
  template: `<div fzButtonGroup aria-label="History" [orientation]="orientation()" [size]="size()"><button>Undo</button><button>Redo</button></div>`,
})
class Host {
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly size = signal<'sm' | undefined>(undefined);
}

describe('FzButtonGroup', () => {
  it('is a named group, with orientation and an inheritable size', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const group: HTMLElement = fixture.nativeElement.querySelector('[fzButtonGroup]');
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('History');
    expect(group.dataset['orientation']).toBe('horizontal');
    expect(group.hasAttribute('data-size')).toBe(false);

    fixture.componentInstance.orientation.set('vertical');
    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();
    expect(group.dataset['orientation']).toBe('vertical');
    expect(group.dataset['size']).toBe('sm');
  });
});
