import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('fizzy-ui playground', () => {
  it('wires aria behavior through fizzy components', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    const tabs = el.querySelectorAll<HTMLElement>('[fzTab]');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    tabs[1].click();
    await fixture.whenStable();
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(fixture.componentInstance['tab']()).toBe('password');

    const trigger = el.querySelector<HTMLElement>('[ngAccordionTrigger]')!;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('[ngAccordionPanel]')!.textContent).toContain('angular/aria');

    const options = el.querySelectorAll<HTMLElement>('[fzOption]');
    options[1].click();
    await fixture.whenStable();
    expect(fixture.componentInstance['fruits']()).toContain('banana');
  });
});
