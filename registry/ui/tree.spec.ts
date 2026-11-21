import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_TREE, FzTreeNode } from './tree';

@Component({
  imports: [FZ_TREE],
  template: `<fz-tree [nodes]="nodes" [(value)]="selected" [multi]="multi()" [selectionMode]="mode()" aria-label="Files" />`,
})
class Host {
  nodes: FzTreeNode<string>[] = [
    {
      value: 'src',
      label: 'src',
      children: [
        { value: 'app', label: 'app', children: [{ value: 'app.ts', label: 'app.ts' }] },
        { value: 'main.ts', label: 'main.ts' },
      ],
    },
    { value: 'locked', label: 'locked', disabled: true },
    { value: 'docs', label: 'docs', expanded: true, children: [{ value: 'readme', label: 'README.md' }] },
  ];
  selected = signal<string[]>([]);
  multi = signal(false);
  mode = signal<'follow' | 'explicit'>('follow');
}

const key = (el: Element, k: string, init: KeyboardEventInit = {}) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...init }));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const tree = el.querySelector<HTMLElement>('fz-tree')!;
  const items = () => [...el.querySelectorAll<HTMLElement>('[role=treeitem]')];
  const labels = () => items().map((i) => i.getAttribute('aria-label') ?? i.firstElementChild!.textContent!.trim());
  const byLabel = (l: string) => items().find((i) => i.firstElementChild!.textContent!.trim() === l)!;
  const stable = () => fixture.whenStable();
  return { fixture, tree, items, labels, byLabel, stable, host: fixture.componentInstance };
}

describe('FzTree', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('renders a tree with levels; collapsed children are not rendered', async () => {
    const { tree, labels, byLabel } = await setup();
    expect(tree.getAttribute('role')).toBe('tree');
    expect(tree.getAttribute('aria-label')).toBe('Files');
    expect(labels()).toEqual(['src', 'locked', 'docs', 'README.md']);
    expect(byLabel('src').getAttribute('aria-expanded')).toBe('false');
    expect(byLabel('docs').getAttribute('aria-expanded')).toBe('true');
    expect(byLabel('locked').hasAttribute('aria-expanded')).toBe(false); // a leaf
    expect(byLabel('README.md').getAttribute('aria-level')).toBe('2');
    expect(byLabel('README.md').parentElement!.getAttribute('role')).toBe('group');
  });

  it('Right expands then enters, Left goes to the parent then collapses', async () => {
    const { byLabel, labels, stable } = await setup();
    byLabel('src').focus();
    key(byLabel('src'), 'ArrowRight');
    await stable();
    expect(byLabel('src').getAttribute('aria-expanded')).toBe('true');
    expect(labels()).toEqual(['src', 'app', 'main.ts', 'locked', 'docs', 'README.md']);
    key(byLabel('src'), 'ArrowRight');
    await stable();
    expect(document.activeElement).toBe(byLabel('app'));
    expect(byLabel('app').getAttribute('aria-level')).toBe('2');

    key(byLabel('app'), 'ArrowLeft');
    await stable();
    expect(document.activeElement).toBe(byLabel('src'));
    key(byLabel('src'), 'ArrowLeft');
    await stable();
    expect(byLabel('src').getAttribute('aria-expanded')).toBe('false');
    expect(labels()).not.toContain('app');
  });

  it('Up/Down follow visible items, focus skips nothing (disabled is soft), selection follows focus', async () => {
    const { host, byLabel, stable } = await setup();
    byLabel('src').focus();
    key(byLabel('src'), 'ArrowDown');
    await stable();
    expect(document.activeElement).toBe(byLabel('locked'));
    expect(byLabel('locked').getAttribute('aria-disabled')).toBe('true');
    expect(host.selected()).toEqual([]); // disabled is never selected
    key(byLabel('locked'), 'ArrowDown');
    await stable();
    expect(document.activeElement).toBe(byLabel('docs'));
    expect(host.selected()).toEqual(['docs']);
    expect(byLabel('docs').getAttribute('aria-selected')).toBe('true');
    key(byLabel('docs'), 'ArrowDown');
    await stable();
    expect(host.selected()).toEqual(['readme']);
  });

  it('explicit (default for a single tree): arrows only move, Enter/Space select', async () => {
    const { host, byLabel, stable } = await setup();
    host.mode.set('explicit');
    await stable();
    byLabel('src').focus();
    key(byLabel('src'), 'ArrowDown');
    key(byLabel('locked'), 'ArrowDown');
    await stable();
    expect(document.activeElement).toBe(byLabel('docs'));
    expect(host.selected()).toEqual([]);
    key(byLabel('docs'), 'Enter');
    await stable();
    expect(host.selected()).toEqual(['docs']);
    key(byLabel('docs'), 'ArrowUp');
    key(byLabel('locked'), 'ArrowUp');
    key(byLabel('src'), ' ');
    await stable();
    expect(host.selected()).toEqual(['src']);
  });

  it('click selects and toggles a parent', async () => {
    const { host, byLabel, labels, stable } = await setup();
    byLabel('src').click();
    await stable();
    expect(host.selected()).toEqual(['src']);
    expect(labels()).toContain('app');
    byLabel('src').click();
    await stable();
    expect(labels()).not.toContain('app');
  });

  it('multi + explicit: Space toggles several, outside value is reflected', async () => {
    const { fixture, host, byLabel, stable } = await setup();
    host.multi.set(true);
    host.mode.set('explicit');
    await stable();
    expect(fixture.nativeElement.querySelector('fz-tree').getAttribute('aria-multiselectable')).toBe('true');
    byLabel('src').focus();
    key(byLabel('src'), ' ');
    await stable();
    key(byLabel('src'), 'End');
    await stable();
    expect(document.activeElement).toBe(byLabel('README.md'));
    key(byLabel('README.md'), ' ');
    await stable();
    expect(host.selected()).toEqual(['src', 'readme']);

    host.selected.set(['docs']);
    await stable();
    expect(byLabel('docs').getAttribute('aria-selected')).toBe('true');
    expect(byLabel('src').getAttribute('aria-selected')).toBe('false');
  });
});
