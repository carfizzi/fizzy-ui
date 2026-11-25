import { TestBed } from '@angular/core/testing';
import fizzy from '../../../registry/theme/fizzy.css' with { loader: 'text' };
import presets from '../../../registry/theme/presets.json';
import { ThemeEditor } from './theme-editor';

async function setup() {
  const fixture = TestBed.createComponent(ThemeEditor);
  fixture.componentRef.setInput('source', (fizzy as unknown as { default?: string }).default ?? (fizzy as unknown as string));
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const code = () => el.querySelector('pre code, code.block, app-code-block')?.textContent ?? '';
  const color = (label: string) => el.querySelector<HTMLInputElement>(`input[type=color][aria-label="${label}"]`)!;
  const preview = (mode: string) => el.querySelector<HTMLElement>(`[data-preview=${mode}]`)!;
  return { fixture, el, code, color, preview, stable: () => fixture.whenStable() };
}

describe('ThemeEditor', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('starts on the defaults: no CSS to copy, every contrast check passes, both previews set their own tokens', async () => {
    const { el, code, preview } = await setup();
    expect(el.textContent).toContain('These are the default tokens');
    expect(code()).toBe('');
    expect(el.querySelectorAll('[data-contrast] li').length).toBeGreaterThan(10);
    expect(el.querySelector('[data-contrast]')!.textContent).not.toContain('fails');
    expect(preview('light').style.getPropertyValue('--background')).toBe('oklch(1 0 0)');
    expect(preview('dark').style.getPropertyValue('--background')).toBe('oklch(0.145 0 0)');
  });

  it('a preset suggests init --theme and colors the previews; an edit or the radius turns it into CSS', async () => {
    const { el, code, color, preview, stable } = await setup();
    el.querySelector<HTMLElement>('fz-select')!.click();
    await stable();
    [...document.querySelectorAll<HTMLElement>('[role=option]')].find((o) => o.textContent!.trim() === 'blue')!.click();
    await stable();
    expect(code()).toContain('npx fizzy-ui init --theme blue');
    expect(preview('light').style.getPropertyValue('--primary')).toBe(presets.blue.light.primary);
    expect(preview('dark').style.getPropertyValue('--color-primary')).toBe(presets.blue.dark.primary);

    const fg = color('primary-foreground, light');
    fg.value = '#2b7fff'; // about the primary itself: unreadable
    fg.dispatchEvent(new Event('input'));
    await stable();
    expect(code()).toContain(':root {');
    expect(code()).toContain('--primary-foreground: #2b7fff;');
    expect(code()).toContain(`--primary: ${presets.blue.light.primary};`);
    expect(code()).toContain('.dark {');
    expect(el.querySelector('[data-contrast]')!.textContent).toMatch(/light: primary-foreground on primary\s*[\d.]+:1 fails/);
  });
});
