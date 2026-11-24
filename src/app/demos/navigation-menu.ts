import { Component } from '@angular/core';
import { FZ_NAVIGATION_MENU } from '../../../registry/ui/navigation-menu';

@Component({
  imports: [FZ_NAVIGATION_MENU],
  template: `
    <nav fzNavigationMenu aria-label="Example" class="min-h-64 w-full max-w-lg">
      <ul>
        <li fzNavigationMenuItem>
          <button fzNavigationMenuTrigger>
            Getting started
            <svg viewBox="0 0 16 16" class="size-3 transition-transform duration-(--fz-duration-control) ease-spring in-aria-expanded:rotate-180" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 6l4 4 4-4" /></svg>
          </button>
          <div fzNavigationMenuContent>
            <ul class="grid w-64 gap-1">
              <li><a href="/introduction"><span class="font-medium">Introduction</span><span class="block text-muted-foreground">What fizzy-ui is and how it works.</span></a></li>
              <li><a href="/installation"><span class="font-medium">Installation</span><span class="block text-muted-foreground">Set up the CLI and add components.</span></a></li>
            </ul>
          </div>
        </li>
        <li fzNavigationMenuItem>
          <button fzNavigationMenuTrigger>
            Components
            <svg viewBox="0 0 16 16" class="size-3 transition-transform duration-(--fz-duration-control) ease-spring in-aria-expanded:rotate-180" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 6l4 4 4-4" /></svg>
          </button>
          <div fzNavigationMenuContent>
            <ul class="grid w-72 grid-cols-2 gap-1">
              <li><a href="/components/dialog">Dialog</a></li>
              <li><a href="/components/menu">Menu</a></li>
              <li><a href="/components/select">Select</a></li>
              <li><a href="/components/tabs">Tabs</a></li>
            </ul>
          </div>
        </li>
        <li><a fzNavigationMenuLink href="/theming">Theming</a></li>
      </ul>
    </nav>
  `,
})
export class Demo {}
