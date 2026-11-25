import { Component, signal } from '@angular/core';
import { Dir } from '@angular/cdk/bidi';
import { FZ_BREADCRUMB } from '../../../registry/ui/breadcrumb';
import { FZ_BUTTON } from '../../../registry/ui/button';
import { FZ_DATE_PICKER } from '../../../registry/ui/calendar';
import { FZ_INPUT_GROUP } from '../../../registry/ui/input-group';
import { FZ_MENU } from '../../../registry/ui/menu';
import { FZ_PAGINATION } from '../../../registry/ui/pagination';
import { FZ_SCROLL_AREA } from '../../../registry/ui/scroll-area';
import { FZ_SELECT } from '../../../registry/ui/select';
import { FZ_SLIDER } from '../../../registry/ui/slider';
import { FZ_SWITCH } from '../../../registry/ui/switch';
import { FZ_TABS } from '../../../registry/ui/tabs';
import { FZ_TOGGLE_GROUP } from '../../../registry/ui/toggle';

/** Theming → Right-to-left: components inside a `dir="rtl"` subtree (CDK `Dir`, so Aria and the overlays see it too). */
@Component({
  selector: 'app-rtl-example',
  imports: [
    Dir, FZ_BREADCRUMB, FZ_BUTTON, FZ_DATE_PICKER, FZ_INPUT_GROUP, FZ_MENU, FZ_PAGINATION, FZ_SCROLL_AREA, FZ_SELECT, FZ_SLIDER,
    FZ_SWITCH, FZ_TABS, FZ_TOGGLE_GROUP,
  ],
  template: `
    <div dir="rtl" lang="he" class="flex flex-col items-start gap-6" data-rtl-example>
      <nav fzBreadcrumb aria-label="מיקום">
        <ol>
          <li><a href="introduction">בית</a></li>
          <li><a href="theming">עיצוב</a></li>
          <li><span aria-current="page">כיוון</span></li>
        </ol>
      </nav>

      <div fzTabs>
        <ul fzTabList [(selectedTab)]="tab" aria-label="הגדרות">
          <li fzTab value="account">חשבון</li>
          <li fzTab value="password">סיסמה</li>
        </ul>
        <div fzTabPanel value="account"><ng-template ngTabContent><p class="pt-2 text-sm">פרטי החשבון.</p></ng-template></div>
        <div fzTabPanel value="password"><ng-template ngTabContent><p class="pt-2 text-sm">שינוי סיסמה.</p></ng-template></div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button fzButton variant="outline" [fzMenuTrigger]="fileMenu.menu">קובץ</button>
        <div fzMenu #fileMenu="fzMenu">
          <div fzMenuItem value="new">חדש</div>
          <div fzMenuItem value="share" [submenu]="shareMenu.menu">שתף</div>
        </div>
        <div fzMenu #shareMenu="fzMenu">
          <div fzMenuItem value="email">אימייל</div>
          <div fzMenuItem value="link">העתק קישור</div>
        </div>
        <fz-select aria-label="תוכנית" placeholder="תוכנית" class="w-40!">
          <fz-select-item value="free" label="חינם" />
          <fz-select-item value="pro" label="מקצועי" />
        </fz-select>
        <fz-date-picker aria-label="תאריך" placeholder="בחר תאריך" class="w-48!" />
      </div>

      <div class="flex flex-wrap items-center gap-6">
        <div fzToggleGroup variant="outline" [(value)]="align" aria-label="יישור">
          <button fzToggleGroupItem value="right">ימין</button>
          <button fzToggleGroupItem value="center">מרכז</button>
          <button fzToggleGroupItem value="left">שמאל</button>
        </div>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" fzSwitch checked /> מצב טיסה</label>
        <input type="range" fzSlider min="0" max="100" value="30" aria-label="עוצמה" class="w-40!" />
      </div>

      <div fzInputGroup class="w-56!">
        <span fzInputGroupAddon>₪</span>
        <input fzInputGroupInput aria-label="מחיר" value="120" />
      </div>

      <fz-pagination [pageCount]="5" label="עמודים" />

      <fz-scroll-area orientation="horizontal" class="w-full max-w-md rounded-md border" aria-label="צבעים">
        <div class="flex gap-3 p-3">
          @for (c of colors; track c) {
            <div class="flex h-16 w-28 shrink-0 items-end rounded-md bg-muted p-2 text-sm">{{ c }}</div>
          }
        </div>
      </fz-scroll-area>
    </div>
  `,
})
export class RtlExample {
  protected readonly tab = signal('account');
  protected readonly align = signal<string | undefined>('right');
  protected readonly colors = ['אדום', 'כתום', 'צהוב', 'ירוק', 'כחול', 'סגול', 'ורוד'];
}
