import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo as CalendarDemo } from '../../src/app/demos/calendar';
import { Demo as DatePickerDemo } from '../../src/app/demos/date-picker';
import { FzCalendarHarness, FzDatePickerHarness } from './calendar.harness';

describe('calendar harnesses', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('FzCalendarHarness: picks a day months away, reads it back', async () => {
    const fixture = TestBed.createComponent(CalendarDemo);
    const calendar = await TestbedHarnessEnvironment.loader(fixture).getHarness(FzCalendarHarness);
    await calendar.selectDate('2027-02-14');
    expect(await calendar.getMonthLabel()).toBe('February 2027');
    expect(await calendar.getSelectedDate()).toBe('2027-02-14');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Sun Feb 14 2027');
  });

  it('FzDatePickerHarness: opens, sees disabled weekend days, picks a weekday, shows it', async () => {
    const fixture = TestBed.createComponent(DatePickerDemo);
    document.body.appendChild(fixture.nativeElement);
    const [, appointment] = await TestbedHarnessEnvironment.loader(fixture).getAllHarnesses(FzDatePickerHarness);
    expect(await appointment.getValueText()).toBe('Pick a weekday');
    // next month's first Monday and Saturday: after today (min) and in reach
    const next = new Date();
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    const monday = new Date(next.getFullYear(), next.getMonth(), 1 + ((8 - next.getDay()) % 7));
    const saturday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 5);
    const calendar = await appointment.getCalendar();
    await calendar.nextMonth();
    expect(await calendar.isDateDisabled(saturday)).toBe(true);
    await appointment.selectDate(monday);
    expect(await appointment.isOpen()).toBe(false);
    expect(await appointment.getValueText()).toBe(new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(monday));
  });
});
