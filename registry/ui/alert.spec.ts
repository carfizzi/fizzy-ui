import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_ALERT } from './alert';

@Component({
  imports: [FZ_ALERT],
  template: `
    <div fzAlert data-t="a"><p fzAlertTitle>Saved</p><div fzAlertDescription>All good.</div></div>
    <div fzAlert variant="destructive" role="status" data-t="b"><svg></svg><p fzAlertTitle>Failed</p></div>
    <div fzAlert [role]="null" data-t="c">Static</div>
  `,
})
class Host {}

describe('FzAlert', () => {
  it('is an alert by default; role can be status or none; variants and slots style it', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const q = (t: string) => fixture.nativeElement.querySelector(`[data-t=${t}]`) as HTMLElement;
    expect(q('a').getAttribute('role')).toBe('alert');
    expect(q('b').getAttribute('role')).toBe('status');
    expect(q('c').hasAttribute('role')).toBe(false);

    expect(q('a').classList).toContain('text-foreground');
    expect(q('b').classList).toContain('text-destructive');
    expect(q('b').classList).toContain('has-[>svg]:grid-cols-[1rem_1fr]');
    expect(q('a').querySelector('[fzAlertTitle]')!.classList).toContain('font-medium');
    expect(q('a').querySelector('[fzAlertDescription]')!.classList).toContain('text-muted-foreground');
  });
});
