import { TestBed } from '@angular/core/testing';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FzToaster } from './toast';

function setup() {
  const toaster = TestBed.inject(FzToaster);
  const announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce').mockResolvedValue();
  const region = () => document.querySelector<HTMLElement>('fz-toast-region')!;
  const toasts = () => [...region().querySelectorAll<HTMLElement>(':scope > div')];
  const titles = () => toasts().map((t) => t.querySelector('p')!.textContent!.trim());
  const show = (...args: Parameters<FzToaster['show']>) => {
    const id = toaster.show(...args);
    TestBed.tick();
    return id;
  };
  return { toaster, announce, region, toasts, titles, show };
}

describe('FzToaster', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('shows a toast in a labelled region and announces it (assertively when destructive)', () => {
    const { announce, region, toasts, show } = setup();
    show('File deleted', { description: 'report.pdf was moved to the trash.' });
    expect(region().getAttribute('aria-label')).toBe('Notifications (Alt+T)');
    expect(toasts()[0].textContent).toContain('report.pdf was moved to the trash.');
    expect(announce).toHaveBeenLastCalledWith('File deleted. report.pdf was moved to the trash.', 'polite');

    show('Upload failed', { variant: 'destructive' });
    expect(toasts()[1].getAttribute('data-variant')).toBe('destructive');
    expect(announce).toHaveBeenLastCalledWith('Upload failed', 'assertive');
  });

  it('closes by itself after its duration; Infinity stays; hover pauses the timers', () => {
    vi.useFakeTimers();
    const { region, titles, show } = setup();
    show('Saved'); // default 5000ms
    show('Sticky', { duration: Infinity });
    vi.advanceTimersByTime(3000);
    region().dispatchEvent(new PointerEvent('pointerenter'));
    vi.advanceTimersByTime(10_000);
    TestBed.tick();
    expect(titles()).toEqual(['Saved', 'Sticky']);

    region().dispatchEvent(new PointerEvent('pointerleave'));
    vi.advanceTimersByTime(1900); // 2000ms were left
    TestBed.tick();
    expect(titles()).toEqual(['Saved', 'Sticky']);
    vi.advanceTimersByTime(100);
    TestBed.tick();
    expect(titles()).toEqual(['Sticky']);
  });

  it('the action runs then closes the toast; Dismiss closes it', () => {
    const { toaster, toasts, titles, show } = setup();
    const run = vi.fn();
    show('File deleted', { action: { label: 'Undo', run } });
    show('Saved');
    const undo = [...toasts()[0].querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Undo')!;
    undo.click();
    TestBed.tick();
    expect(run).toHaveBeenCalledOnce();
    expect(titles()).toEqual(['Saved']);

    toasts()[0].querySelector<HTMLElement>('[aria-label=Dismiss]')!.click();
    TestBed.tick();
    expect(titles()).toEqual([]);
    expect(toaster.toasts()).toEqual([]);
  });

  it('keeps at most three: a fourth drops the oldest', () => {
    const { titles, show } = setup();
    ['1', '2', '3', '4'].forEach((t) => show(t));
    expect(titles()).toEqual(['2', '3', '4']);
  });

  it('Alt+T moves focus to the toasts; Escape closes the focused one and gives focus back', () => {
    const { region, titles, show } = setup();
    const input = document.body.appendChild(document.createElement('input'));
    input.focus();
    show('File deleted', { action: { label: 'Undo', run: () => {} } });
    expect(document.activeElement).toBe(input); // a toast never takes focus by itself

    input.dispatchEvent(new KeyboardEvent('keydown', { key: '†', code: 'KeyT', altKey: true, bubbles: true }));
    expect(document.activeElement).toBe(region());
    const undo = region().querySelector('button')!;
    undo.focus();
    undo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    TestBed.tick();
    expect(titles()).toEqual([]);
    expect(document.activeElement).toBe(input);
  });
});
