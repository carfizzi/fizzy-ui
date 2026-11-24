import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzInputOtp } from './input-otp';

@Component({
  imports: [FzInputOtp],
  template: `<fz-input-otp [(value)]="code" [pattern]="pattern()" [length]="length()" aria-label="Verification code" (complete)="done.set($event)" />`,
})
class Host {
  readonly code = signal('');
  readonly pattern = signal<'digits' | 'alphanumeric'>('digits');
  readonly length = signal(6);
  readonly done = signal('');
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const field = el.querySelector('input')!;
  const type = async (text: string) => {
    field.value = text;
    field.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  const boxes = () => [...el.querySelectorAll('[aria-hidden="true"] > div')].map((b) => b.textContent!.trim());
  return { fixture, host: fixture.componentInstance, el, field, type, boxes };
}

describe('FzInputOtp', () => {
  it('is one named text input for one-time codes; the boxes are hidden from screen readers', async () => {
    const { el, field, boxes } = await setup();
    expect(el.querySelectorAll('input').length).toBe(1);
    expect(field.getAttribute('aria-label')).toBe('Verification code');
    expect(el.querySelector('fz-input-otp')!.hasAttribute('aria-label')).toBe(false);
    expect(field.autocomplete).toBe('one-time-code');
    expect(field.inputMode).toBe('numeric');
    expect(boxes()).toEqual(['', '', '', '', '', '']);
  });

  it('keeps digits only, so a pasted "123 456" or "12-34-56" fills every box, and emits complete', async () => {
    const { host, field, type, boxes } = await setup();
    await type('12a3');
    expect(host.code()).toBe('123');
    expect(field.value).toBe('123');
    expect(host.done()).toBe('');

    await type('123 456');
    expect(host.code()).toBe('123456');
    expect(boxes()).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(host.done()).toBe('123456');

    await type('12-34-56-78');
    expect(host.code()).toBe('123456'); // cut to the length
  });

  it('alphanumeric keeps letters; a value set from outside shows in the boxes and the input', async () => {
    const { fixture, host, field, type, boxes } = await setup();
    host.pattern.set('alphanumeric');
    host.length.set(4);
    await fixture.whenStable();
    expect(field.inputMode).toBe('text');
    await type('ab-12');
    expect(host.code()).toBe('ab12');

    host.code.set('');
    await fixture.whenStable();
    expect(field.value).toBe('');
    expect(boxes()).toEqual(['', '', '', '']);
  });

  it('marks the box to fill next while focused', async () => {
    const { fixture, el, field, type } = await setup();
    await type('12');
    field.focus();
    field.setSelectionRange(2, 2);
    field.dispatchEvent(new Event('keyup'));
    await fixture.whenStable();
    const active = [...el.querySelectorAll('[aria-hidden="true"] > div')].map((b) => b.hasAttribute('data-active'));
    expect(active).toEqual([false, false, true, false, false, false]);
  });
});
