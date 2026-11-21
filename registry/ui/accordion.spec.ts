import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_ACCORDION } from './accordion';

@Component({
  imports: [FZ_ACCORDION],
  template: `
    <div fzAccordion [multiExpandable]="multi()">
      <fz-accordion-item title="One">Content one</fz-accordion-item>
      <fz-accordion-item title="Two">Content two</fz-accordion-item>
      <fz-accordion-item title="Three" [disabled]="true">Content three</fz-accordion-item>
    </div>
  `,
})
class Host {
  multi = signal(false);
}

const key = (el: HTMLElement, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

async function setup(multi = false) {
  const fixture = TestBed.createComponent(Host);
  fixture.componentInstance.multi.set(multi);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const triggers = [...el.querySelectorAll<HTMLElement>('[ngAccordionTrigger]')];
  const panels = [...el.querySelectorAll<HTMLElement>('[ngAccordionPanel]')];
  return { fixture, triggers, panels, expanded: () => triggers.map((t) => t.getAttribute('aria-expanded')) };
}

describe('FzAccordion', () => {
  it('click opens the panel and renders its content', async () => {
    const { fixture, triggers, panels, expanded } = await setup();
    expect(expanded()).toEqual(['false', 'false', 'false']);
    expect(panels[0].hasAttribute('inert')).toBe(true);

    triggers[0].click();
    await fixture.whenStable();
    expect(expanded()[0]).toBe('true');
    expect(panels[0].hasAttribute('inert')).toBe(false);
    expect(panels[0].textContent).toContain('Content one');
  });

  it('single mode closes the other item', async () => {
    const { fixture, triggers, expanded } = await setup();
    triggers[0].click();
    await fixture.whenStable();
    triggers[1].click();
    await fixture.whenStable();
    expect(expanded()).toEqual(['false', 'true', 'false']);
  });

  it('multiExpandable keeps several items open', async () => {
    const { fixture, triggers, expanded } = await setup(true);
    triggers[0].click();
    await fixture.whenStable();
    triggers[1].click();
    await fixture.whenStable();
    expect(expanded()).toEqual(['true', 'true', 'false']);
  });

  it('disabled item does not open', async () => {
    const { fixture, triggers, expanded } = await setup();
    triggers[2].click();
    await fixture.whenStable();
    expect(expanded()[2]).toBe('false');
  });

  it('keyboard: arrows move focus, Enter toggles', async () => {
    const { fixture, triggers, expanded } = await setup();
    triggers[0].focus();
    triggers[0].click();
    await fixture.whenStable();
    key(triggers[0], 'ArrowDown');
    await fixture.whenStable();
    expect(document.activeElement).toBe(triggers[1]);

    key(triggers[1], 'Enter');
    await fixture.whenStable();
    expect(expanded()[1]).toBe('true');
  });
});
