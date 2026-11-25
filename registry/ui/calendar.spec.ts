import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_CALENDAR, FZ_DATE_PICKER } from './calendar';

@Component({
  imports: [FZ_CALENDAR],
  template: `<fz-calendar [(value)]="date" [firstDayOfWeek]="1" [min]="min()" [max]="max()" [dateDisabled]="weekend()" />`,
})
class Host {
  date = signal<Date | undefined>(new Date(2026, 2, 15));
  min = signal<Date | undefined>(undefined);
  max = signal<Date | undefined>(undefined);
  weekend = signal<(d: Date) => boolean>(() => false);
}

const key = (k: string, shiftKey = false) =>
  (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey, bubbles: true, cancelable: true }));

async function setup() {
  vi.useFakeTimers({ toFake: ['Date'] }); // only the clock: today is Tuesday 10 March 2026
  vi.setSystemTime(new Date(2026, 2, 10, 12));
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const cell = (date: string) => el.querySelector<HTMLElement>(`td[data-date="${date}"]`);
  const heading = () => el.querySelector('h2')!.textContent!.trim();
  const tabStop = () => el.querySelector<HTMLElement>('td[tabindex="0"]')!.dataset['date'];
  const stable = () => fixture.whenStable();
  return { fixture, el, host: fixture.componentInstance, cell, heading, tabStop, stable };
}

describe('FzCalendar', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('a grid labelled by the month; weekdays from the locale; one Tab stop on the value; days named in full; today marked', async () => {
    const { el, cell, heading, tabStop } = await setup();
    const grid = el.querySelector('[role=grid]')!;
    expect(heading()).toBe('March 2026');
    expect(document.getElementById(grid.getAttribute('aria-labelledby')!)!.textContent!.trim()).toBe('March 2026');
    expect([...el.querySelectorAll('th')].map((th) => th.textContent!.trim())).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(el.querySelector('th')!.getAttribute('abbr')).toBe('Monday');
    expect(el.querySelectorAll('td[data-date]').length).toBe(31);
    expect(el.querySelectorAll('td[tabindex="0"]').length).toBe(1);
    expect(tabStop()).toBe('2026-03-15');
    expect(cell('2026-03-15')!.getAttribute('aria-selected')).toBe('true');
    expect(cell('2026-03-15')!.getAttribute('aria-label')).toBe('Sunday, March 15, 2026');
    expect(cell('2026-03-10')!.getAttribute('aria-current')).toBe('date');
    expect(cell('2026-03-01')!.closest('tr')!.querySelectorAll('td:not([data-date])').length).toBe(6); // 1 March 2026 is a Sunday
  });

  it('keyboard: arrows by day and week, Home/End in the week, PageUp/Down by month (Shift: year), crossing months; Enter picks', async () => {
    const { host, cell, heading, tabStop, stable } = await setup();
    cell('2026-03-15')!.focus();
    const press = async (k: string, shift = false) => (key(k, shift), await stable());
    await press('ArrowRight');
    expect(tabStop()).toBe('2026-03-16');
    expect(document.activeElement).toBe(cell('2026-03-16'));
    await press('ArrowDown');
    expect(tabStop()).toBe('2026-03-23');
    await press('End');
    expect(tabStop()).toBe('2026-03-29'); // Sunday
    await press('Home');
    expect(tabStop()).toBe('2026-03-23'); // Monday
    await press('ArrowDown');
    await press('ArrowDown');
    expect(tabStop()).toBe('2026-04-06');
    expect(heading()).toBe('April 2026');
    await press('PageUp');
    expect(tabStop()).toBe('2026-03-06');
    await press('PageDown', true);
    expect(heading()).toBe('March 2027');
    await press('Enter');
    expect(host.date()).toEqual(new Date(2027, 2, 6));
    expect(cell('2027-03-06')!.getAttribute('aria-selected')).toBe('true');
  });

  it('min and max bound the arrows and the month buttons; disabled days stay reachable but cannot be picked', async () => {
    const { el, host, cell, tabStop, stable } = await setup();
    host.min.set(new Date(2026, 2, 12));
    host.max.set(new Date(2026, 2, 20));
    host.weekend.set((d: Date) => d.getDay() === 0 || d.getDay() === 6);
    await stable();
    const [prev, next] = el.querySelectorAll<HTMLButtonElement>('button');
    expect(prev.getAttribute('aria-disabled')).toBe('true');
    expect(next.getAttribute('aria-disabled')).toBe('true');
    expect(cell('2026-03-11')!.getAttribute('aria-disabled')).toBe('true');

    cell('2026-03-15')!.focus();
    key('PageDown');
    await stable();
    expect(tabStop()).toBe('2026-03-20'); // clamped to max
    cell('2026-03-14')!.click(); // a Saturday
    await stable();
    expect(host.date()).toEqual(new Date(2026, 2, 15));
    expect(tabStop()).toBe('2026-03-14');
  });
});

@Component({
  imports: [FZ_DATE_PICKER],
  template: `<fz-date-picker [(value)]="date" />`,
})
class PickerHost {
  date = signal<Date | undefined>(undefined);
}

describe('FzDatePicker', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('a button opens the calendar with focus on today; picking closes it, shows the date and refocuses the button; Escape closes', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 2, 10, 12));
    const fixture = TestBed.createComponent(PickerHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const stable = () => fixture.whenStable();
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    expect(button.textContent).toContain('Pick a date');

    button.click();
    await stable();
    await stable();
    const dialog = document.querySelector<HTMLElement>('[role=dialog]')!;
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe(dialog.id);
    expect(document.activeElement).toBe(dialog.querySelector('td[data-date="2026-03-10"]'));

    key('ArrowRight');
    await stable();
    key('Enter');
    await stable();
    expect(fixture.componentInstance.date()).toEqual(new Date(2026, 2, 11));
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.textContent).toContain('Mar 11, 2026');
    expect(document.activeElement).toBe(button);

    button.click();
    await stable();
    await stable();
    key('Escape');
    await stable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });
});
