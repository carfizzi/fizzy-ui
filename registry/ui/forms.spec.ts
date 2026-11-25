import { Component, Directive, Type, WritableSignal, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { FieldTree, FormField, disabled, form } from '@angular/forms/signals';
import { FZ_CALENDAR, FZ_DATE_PICKER } from './calendar';
import { FZ_CHIPS } from './chips';
import { FZ_COMBOBOX } from './combobox';
import { FZ_INPUT_OTP } from './input-otp';
import { FZ_MULTISELECT, FZ_SELECT } from './select';
import { FZ_TOGGLE_GROUP } from './toggle';

// Every custom value control, bound through each forms API: Signal Forms, Reactive Forms, ngModel.
type Api = 'signal' | 'reactive' | 'ngModel';
const FORMS = [FormField, ReactiveFormsModule, FormsModule];

@Directive()
abstract class Forms<T> {
  api: Api = 'signal';
  readonly off = signal(false);
  readonly data = signal<{ v: T }>({ v: undefined as T });
  readonly f = form(this.data as unknown as WritableSignal<{ v: string }>, (p) => disabled(p.v, () => this.off())) as unknown as { v: FieldTree<T> };
  readonly ctrl = new FormControl<T>(undefined as T, { nonNullable: true });
  readonly nm = signal<T>(undefined as T);
  readonly ngModel = viewChild(NgModel);

  start(v: T) {
    this.data.set({ v });
    this.ctrl.setValue(v);
    this.nm.set(v);
  }
  value(): T {
    return this.api === 'signal' ? this.data().v : this.api === 'reactive' ? this.ctrl.value : this.nm();
  }
  set(v: T) {
    if (this.api === 'signal') this.data.set({ v });
    else if (this.api === 'reactive') this.ctrl.setValue(v);
    else this.nm.set(v);
  }
  disable() {
    if (this.api === 'reactive') this.ctrl.disable();
    else this.off.set(true);
  }
  touched() {
    return this.api === 'signal' ? this.f.v().touched() : this.api === 'reactive' ? this.ctrl.touched : !!this.ngModel()?.touched;
  }
}

// The same control three times, one per API (AOT needs each template written out).
@Component({
  imports: [FZ_SELECT, FORMS],
  template: `
    @switch (api) {
      @case ('signal') { <fz-select [formField]="f.v" aria-label="Fruit"><fz-select-item value="apple" label="Apple" /><fz-select-item value="kiwi" label="Kiwi" /></fz-select> }
      @case ('reactive') { <fz-select [formControl]="ctrl" aria-label="Fruit"><fz-select-item value="apple" label="Apple" /><fz-select-item value="kiwi" label="Kiwi" /></fz-select> }
      @case ('ngModel') { <fz-select [(ngModel)]="nm" [disabled]="off()" aria-label="Fruit"><fz-select-item value="apple" label="Apple" /><fz-select-item value="kiwi" label="Kiwi" /></fz-select> }
    }
  `,
})
class SelectHost extends Forms<string> {}

@Component({
  imports: [FZ_MULTISELECT, FORMS],
  template: `
    @switch (api) {
      @case ('signal') { <fz-multiselect [formField]="f.v" aria-label="Fruit"><fz-select-item value="apple" label="Apple" /><fz-select-item value="kiwi" label="Kiwi" /></fz-multiselect> }
      @case ('reactive') { <fz-multiselect [formControl]="ctrl" aria-label="Fruit"><fz-select-item value="apple" label="Apple" /><fz-select-item value="kiwi" label="Kiwi" /></fz-multiselect> }
      @case ('ngModel') { <fz-multiselect [(ngModel)]="nm" [disabled]="off()" aria-label="Fruit"><fz-select-item value="apple" label="Apple" /><fz-select-item value="kiwi" label="Kiwi" /></fz-multiselect> }
    }
  `,
})
class MultiselectHost extends Forms<string[]> {}

@Component({
  imports: [FZ_COMBOBOX, FORMS],
  template: `
    @switch (api) {
      @case ('signal') { <input fzCombobox [options]="['Italy', 'Spain']" aria-label="Country" [formField]="f.v" /> }
      @case ('reactive') { <input fzCombobox [options]="['Italy', 'Spain']" aria-label="Country" [formControl]="ctrl" /> }
      @case ('ngModel') { <input fzCombobox [options]="['Italy', 'Spain']" aria-label="Country" [(ngModel)]="nm" [disabled]="off()" /> }
    }
  `,
})
class ComboboxHost extends Forms<string> {}

@Component({
  imports: [FZ_CHIPS, FORMS],
  template: `
    @switch (api) {
      @case ('signal') { <fz-chip-listbox multiple aria-label="Diet" [formField]="f.v" ><fz-chip value="vegan" /><fz-chip value="halal" /></fz-chip-listbox> }
      @case ('reactive') { <fz-chip-listbox multiple aria-label="Diet" [formControl]="ctrl" ><fz-chip value="vegan" /><fz-chip value="halal" /></fz-chip-listbox> }
      @case ('ngModel') { <fz-chip-listbox multiple aria-label="Diet" [(ngModel)]="nm" [disabled]="off()" ><fz-chip value="vegan" /><fz-chip value="halal" /></fz-chip-listbox> }
    }
  `,
})
class ChipListboxHost extends Forms<string[]> {}

@Component({
  imports: [FZ_CHIPS, FORMS],
  template: `
    @switch (api) {
      @case ('signal') { <fz-chip-input aria-label="Tags" [formField]="f.v" /> }
      @case ('reactive') { <fz-chip-input aria-label="Tags" [formControl]="ctrl" /> }
      @case ('ngModel') { <fz-chip-input aria-label="Tags" [(ngModel)]="nm" [disabled]="off()" /> }
    }
  `,
})
class ChipInputHost extends Forms<string[]> {}

@Component({
  imports: [FZ_INPUT_OTP, FORMS],
  template: `
    @switch (api) {
      @case ('signal') { <fz-input-otp [length]="4" aria-label="Code" [formField]="f.v" /> }
      @case ('reactive') { <fz-input-otp [length]="4" aria-label="Code" [formControl]="ctrl" /> }
      @case ('ngModel') { <fz-input-otp [length]="4" aria-label="Code" [(ngModel)]="nm" [disabled]="off()" /> }
    }
  `,
})
class InputOtpHost extends Forms<string> {}

@Component({
  imports: [FZ_CALENDAR, FORMS],
  template: `
    @switch (api) {
      @case ('signal') { <fz-calendar [formField]="f.v" /> }
      @case ('reactive') { <fz-calendar [formControl]="ctrl" /> }
      @case ('ngModel') { <fz-calendar [(ngModel)]="nm" [disabled]="off()" /> }
    }
  `,
})
class CalendarHost extends Forms<Date> {}

@Component({
  imports: [FZ_DATE_PICKER, FORMS],
  template: `
    @switch (api) {
      @case ('signal') { <fz-date-picker [formField]="f.v" /> }
      @case ('reactive') { <fz-date-picker [formControl]="ctrl" /> }
      @case ('ngModel') { <fz-date-picker [(ngModel)]="nm" [disabled]="off()" /> }
    }
  `,
})
class DatePickerHost extends Forms<Date> {}

@Component({
  imports: [FZ_TOGGLE_GROUP, FORMS],
  template: `
    @switch (api) {
      @case ('signal') { <div fzToggleGroup aria-label="Align" [formField]="f.v" ><button fzToggleGroupItem value="left">Left</button><button fzToggleGroupItem value="right">Right</button></div> }
      @case ('reactive') { <div fzToggleGroup aria-label="Align" [formControl]="ctrl" ><button fzToggleGroupItem value="left">Left</button><button fzToggleGroupItem value="right">Right</button></div> }
      @case ('ngModel') { <div fzToggleGroup aria-label="Align" [(ngModel)]="nm" [disabled]="off()" ><button fzToggleGroupItem value="left">Left</button><button fzToggleGroupItem value="right">Right</button></div> }
    }
  `,
})
class ToggleGroupHost extends Forms<string> {}

const text = (el: Element) => el.textContent!.replace(/\s+/g, ' ').trim();
const click = (selector: string) => document.querySelector<HTMLElement>(selector)!.click();
const optionByText = (t: string) => [...document.querySelectorAll<HTMLElement>('[role=option]')].find((o) => text(o) === t)!;
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const type = (input: HTMLInputElement, value: string) => {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};
const march = (d: number) => new Date(2026, 2, d);

interface Case<T> {
  host: Type<Forms<any>>;
  initial: T;
  next: T;
  /** What the control shows for a value. */
  shows: (el: HTMLElement) => unknown;
  shown: (v: T) => unknown;
  /** The user picks `next`, starting from `initial`. */
  pick: (el: HTMLElement, stable: () => Promise<void>) => Promise<void>;
}

const CASES: Record<string, Case<any>> = {
  select: {
    host: SelectHost,
    initial: 'apple',
    next: 'kiwi',
    shows: text,
    shown: (v: string) => (v === 'apple' ? 'Apple' : 'Kiwi'),
    pick: async (el, stable) => (el.click(), await stable(), optionByText('Kiwi').click()),
  } satisfies Case<string>,
  multiselect: {
    host: MultiselectHost,
    initial: ['apple'],
    next: ['apple', 'kiwi'],
    shows: text,
    shown: (v: string[]) => v.map((x) => (x === 'apple' ? 'Apple' : 'Kiwi')).join(', '),
    pick: async (el, stable) => (el.click(), await stable(), optionByText('Kiwi').click()),
  } satisfies Case<string[]>,
  combobox: {
    host: ComboboxHost,
    initial: 'Italy',
    next: 'Spain',
    shows: (el) => (el as HTMLInputElement).value,
    shown: (v: string) => v,
    pick: async (el, stable) => {
      el.focus();
      type(el as HTMLInputElement, 'sp');
      await stable();
      optionByText('Spain').click();
    },
  } satisfies Case<string>,
  'chip-listbox': {
    host: ChipListboxHost,
    initial: ['vegan'],
    next: ['vegan', 'halal'],
    shows: (el) => [...el.querySelectorAll('[aria-selected=true]')].map(text),
    shown: (v: string[]) => v,
    pick: async () => optionByText('halal').click(),
  } satisfies Case<string[]>,
  'chip-input': {
    host: ChipInputHost,
    initial: ['a'],
    next: ['a', 'b'],
    shows: (el) => [...el.querySelectorAll('li')].map(text),
    shown: (v: string[]) => v,
    pick: async (el) => {
      const input = el.querySelector('input')!;
      input.value = 'b';
      key(input, 'Enter');
    },
  } satisfies Case<string[]>,
  'input-otp': {
    host: InputOtpHost,
    initial: '12',
    next: '1234',
    shows: (el) => el.querySelector('input')!.value,
    shown: (v: string) => v,
    pick: async (el) => type(el.querySelector('input')!, '1234'),
  } satisfies Case<string>,
  calendar: {
    host: CalendarHost,
    initial: march(10),
    next: march(12),
    shows: (el) => el.querySelector('[aria-selected=true]')?.getAttribute('data-date'),
    shown: (v: Date) => `2026-03-${v.getDate()}`,
    pick: async () => click('[data-date="2026-03-12"]'),
  } satisfies Case<Date>,
  'date-picker': {
    host: DatePickerHost,
    initial: march(10),
    next: march(12),
    shows: (el) => text(el.querySelector('button')!),
    shown: (v: Date) => `Mar ${v.getDate()}, 2026`,
    pick: async (el, stable) => (el.querySelector('button')!.click(), await stable(), click('[data-date="2026-03-12"]')),
  } satisfies Case<Date>,
  'toggle-group': {
    host: ToggleGroupHost,
    initial: 'left',
    next: 'right',
    shows: (el) => text(el.querySelector('[aria-pressed=true]')!),
    shown: (v: string) => (v === 'left' ? 'Left' : 'Right'),
    pick: async (el) => [...el.querySelectorAll('button')][1].click(),
  } satisfies Case<string>,
};

// The first thing in the control that takes focus (the host itself, an input, a roving item…).
const focusable = (el: HTMLElement) => (el.matches('input, [tabindex="0"]') ? el : el.querySelector<HTMLElement>('input, button, [tabindex="0"]')!);
const isDisabled = (el: HTMLElement) => el.matches(':disabled, [aria-disabled=true]') || !!el.querySelector(':disabled, [role=grid][aria-disabled=true], [role=listbox][aria-disabled=true]');

describe('Forms', () => {
  afterEach(() => (document.body.innerHTML = ''));

  for (const [name, c] of Object.entries(CASES)) {
    for (const api of ['signal', 'reactive', 'ngModel'] as const) {
      it(`${name} with ${api}: value both ways, touched on leaving, disabled`, async () => {
        const fixture: ComponentFixture<Forms<unknown>> = TestBed.createComponent(c.host);
        const host = fixture.componentInstance;
        host.api = api;
        host.start(c.initial);
        document.body.appendChild(fixture.nativeElement);
        const stable = () => fixture.whenStable();
        await stable();
        const el = (fixture.nativeElement as HTMLElement).firstElementChild as HTMLElement;

        expect(c.shows(el)).toEqual(c.shown(c.initial));
        host.set(c.next);
        await stable();
        expect(c.shows(el)).toEqual(c.shown(c.next));

        host.set(c.initial);
        await stable();
        expect(host.touched()).toBe(false);
        await c.pick(el, stable);
        await stable();
        expect(host.value()).toEqual(c.next);

        const target = focusable(el);
        target.focus();
        target.blur();
        await stable();
        expect(host.touched()).toBe(true);

        expect(isDisabled(el)).toBe(false);
        host.disable();
        await stable();
        expect(isDisabled(el)).toBe(true);
      });
    }
  }
});
