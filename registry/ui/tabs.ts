import { afterRenderEffect, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { Tab, TabContent, TabList, TabPanel, Tabs } from '@angular/aria/tabs';

@Directive({
  selector: '[fzTabs]',
  hostDirectives: [Tabs],
  host: { class: 'flex flex-col gap-2' },
})
export class FzTabs {}

@Directive({
  selector: '[fzTabList]',
  hostDirectives: [
    {
      directive: TabList,
      inputs: ['selectedTab', 'orientation', 'selectionMode', 'disabled'],
      outputs: ['selectedTabChange'],
    },
  ],
  host: { class: 'relative isolate inline-flex w-fit items-center rounded-lg bg-muted p-1 text-muted-foreground' },
})
export class FzTabList {
  constructor() {
    const host: HTMLElement = inject(ElementRef).nativeElement;
    const list = inject(TabList);
    // One highlight behind the tabs, moved to the selected tab so it slides instead of jumping.
    const indicator = host.ownerDocument.createElement('span');
    indicator.ariaHidden = 'true';
    indicator.className =
      'pointer-events-none absolute top-0 left-0 -z-10 rounded-md bg-background shadow-sm ' +
      'data-ready:motion-safe:transition-[translate,width,height] data-ready:motion-safe:duration-(--fz-duration-control) data-ready:motion-safe:ease-spring';
    host.append(indicator);

    const place = () => {
      const tab = host.querySelector<HTMLElement>('[role=tab][aria-selected=true]');
      indicator.hidden = !tab;
      if (!tab) return;
      // the first placement must not slide in from the corner
      if (indicator.style.width) indicator.dataset['ready'] = '';
      indicator.style.translate = `${tab.offsetLeft}px ${tab.offsetTop}px`;
      indicator.style.width = `${tab.offsetWidth}px`;
      indicator.style.height = `${tab.offsetHeight}px`;
    };
    afterRenderEffect(() => {
      list.selectedTab();
      place();
    });
    // tab sizes change with fonts loading, text, and container width
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(place);
      ro.observe(host);
      inject(DestroyRef).onDestroy(() => ro.disconnect());
    }
  }
}

@Directive({
  selector: '[fzTab]',
  hostDirectives: [{ directive: Tab, inputs: ['value', 'disabled'] }],
  host: {
    class:
      'inline-flex cursor-pointer items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors ' +
      'outline-none focus-visible:ring-2 focus-visible:ring-ring aria-disabled:opacity-50 aria-selected:text-foreground',
  },
})
export class FzTab {}

@Directive({
  selector: '[fzTabPanel]',
  hostDirectives: [{ directive: TabPanel, inputs: ['value'] }],
  host: { class: 'rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring [&[inert]]:hidden' },
})
export class FzTabPanel {}

/** Import this in your component: content of each panel goes in `<ng-template ngTabContent>`. */
export const FZ_TABS = [FzTabs, FzTabList, FzTab, FzTabPanel, TabContent] as const;
