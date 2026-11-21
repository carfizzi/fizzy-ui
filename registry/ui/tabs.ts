import { Directive } from '@angular/core';
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
  host: { class: 'inline-flex w-fit items-center rounded-lg bg-muted p-1 text-muted-foreground' },
})
export class FzTabList {}

@Directive({
  selector: '[fzTab]',
  hostDirectives: [{ directive: Tab, inputs: ['value', 'disabled'] }],
  host: {
    class:
      'inline-flex cursor-pointer items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-all ' +
      'outline-none focus-visible:ring-2 focus-visible:ring-ring aria-disabled:opacity-50 ' +
      'aria-selected:bg-background aria-selected:text-foreground aria-selected:shadow-sm',
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
