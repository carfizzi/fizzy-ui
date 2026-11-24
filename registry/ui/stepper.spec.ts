import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_STEPPER, FzStepper } from './stepper';

@Component({
  imports: [FZ_STEPPER],
  template: `
    <fz-stepper [(step)]="step" [linear]="linear()" aria-label="Checkout">
      <fz-step label="Shipping" [completed]="done()[0]"><input aria-label="Name" /></fz-step>
      <fz-step label="Payment" [completed]="done()[1]">Pay</fz-step>
      <fz-step label="Review">Review</fz-step>
    </fz-stepper>
  `,
})
class Host {
  step = signal(0);
  linear = signal(true);
  done = signal([false, false]);
  stepper = viewChild.required(FzStepper);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const headers = () => [...el.querySelectorAll<HTMLButtonElement>('ol button')];
  const steps = () => [...el.querySelectorAll<HTMLElement>('fz-step')];
  const visible = () => steps().map((s) => !s.hidden);
  return { fixture, el, host: fixture.componentInstance, headers, steps, visible, stable: () => fixture.whenStable() };
}

describe('FzStepper', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('an ordered list of step buttons; the current one is aria-current="step" and its content shows', async () => {
    const { el, headers, steps, visible } = await setup();
    const list = el.querySelector('ol')!;
    expect(list.getAttribute('aria-label')).toBe('Checkout');
    expect(el.querySelector('fz-stepper')!.hasAttribute('aria-label')).toBe(false);
    expect(headers().map((h) => h.textContent!.replace(/\s+/g, ' ').trim())).toEqual([
      '1 Step 1 of 3: Shipping',
      '2 Step 2 of 3: Payment',
      '3 Step 3 of 3: Review',
    ]);
    expect(headers()[0].getAttribute('aria-current')).toBe('step');
    expect(visible()).toEqual([true, false, false]);
    expect(steps()[0].getAttribute('role')).toBe('group');
    expect(steps()[0].getAttribute('aria-labelledby')).toBe(headers()[0].id);
  });

  it('linear: a step opens only once the ones before it are completed', async () => {
    const { host, headers, visible, stable } = await setup();
    expect(headers().map((h) => h.getAttribute('aria-disabled'))).toEqual([null, 'true', 'true']);
    headers()[2].click();
    await stable();
    expect(host.step()).toBe(0);

    host.done.set([true, false]);
    await stable();
    expect(headers()[0].textContent).toContain(', completed');
    headers()[1].click();
    await stable();
    expect(host.step()).toBe(1);
    expect(visible()).toEqual([false, true, false]);
    headers()[2].click();
    await stable();
    expect(host.step()).toBe(1);

    host.linear.set(false);
    await stable();
    headers()[2].click();
    await stable();
    expect(host.step()).toBe(2);
  });

  it('next() and previous() move and focus the new step header; they stop at the ends and at locked steps', async () => {
    const { host, headers, stable } = await setup();
    host.stepper().next(); // Shipping not completed: stays
    await stable();
    expect(host.step()).toBe(0);
    host.done.set([true, true]);
    await stable();
    host.stepper().next();
    await stable();
    expect(host.step()).toBe(1);
    expect(document.activeElement).toBe(headers()[1]);
    host.stepper().next();
    host.stepper().next();
    await stable();
    expect(host.step()).toBe(2);
    host.stepper().previous();
    await stable();
    expect(host.step()).toBe(1);
    expect(document.activeElement).toBe(headers()[1]);
  });

  it('hidden steps keep their content (and form values)', async () => {
    const { host, el, stable } = await setup();
    const input = el.querySelector('input')!;
    input.value = 'Ada';
    host.done.set([true, false]);
    host.step.set(1);
    await stable();
    expect(el.querySelector('input')).toBe(input);
    expect(input.value).toBe('Ada');
  });
});
