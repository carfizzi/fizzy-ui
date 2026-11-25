import { Component, input } from '@angular/core';
import { FZ_AVATAR } from '../../../registry/ui/avatar';
import { FZ_BADGE } from '../../../registry/ui/badge';
import { FZ_BUTTON } from '../../../registry/ui/button';
import { FZ_BUTTON_GROUP } from '../../../registry/ui/button-group';
import { FZ_DATE_PICKER } from '../../../registry/ui/calendar';
import { FZ_CHIPS } from '../../../registry/ui/chips';
import { FZ_CLOSE_BUTTON } from '../../../registry/ui/close-button';
import { FZ_COMBOBOX } from '../../../registry/ui/combobox';
import { FZ_INPUT } from '../../../registry/ui/input';
import { FZ_INPUT_GROUP } from '../../../registry/ui/input-group';
import { FZ_INPUT_OTP } from '../../../registry/ui/input-otp';
import { FZ_PAGINATION } from '../../../registry/ui/pagination';
import { FZ_MULTISELECT, FZ_SELECT } from '../../../registry/ui/select';
import { FZ_SPINNER } from '../../../registry/ui/spinner';
import { FZ_TABS } from '../../../registry/ui/tabs';
import { FZ_TEXTAREA } from '../../../registry/ui/textarea';
import { FZ_TOGGLE, FZ_TOGGLE_GROUP } from '../../../registry/ui/toggle';
import { FZ_TOOLBAR } from '../../../registry/ui/toolbar';

/**
 * The component page's "Sizes": one small instance of `name` per size, side by side. Each sits in a
 * `data-size` container and sets no size itself, the way a density setting works.
 * Names here must match SIZED in docs.ts.
 */
@Component({
  selector: 'app-sizes',
  imports: [
    FZ_AVATAR, FZ_BADGE, FZ_BUTTON, FZ_BUTTON_GROUP, FZ_DATE_PICKER, FZ_CHIPS, FZ_CLOSE_BUTTON, FZ_COMBOBOX, FZ_INPUT, FZ_INPUT_GROUP,
    FZ_INPUT_OTP, FZ_PAGINATION, FZ_MULTISELECT, FZ_SELECT, FZ_SPINNER, FZ_TABS, FZ_TEXTAREA, FZ_TOGGLE, FZ_TOGGLE_GROUP, FZ_TOOLBAR,
  ],
  template: `
    <div class="flex flex-wrap items-end gap-x-8 gap-y-6" data-sizes>
      @for (s of sizes; track s) {
        <div [attr.data-size]="s" class="flex flex-col items-start gap-2">
          @switch (name()) {
            @case ('avatar') { <fz-avatar alt="Ada Lovelace" fallback="AL" /> }
            @case ('badge') { <span fzBadge>Badge</span> }
            @case ('button') { <button fzButton>Button</button> }
            @case ('button-group') {
              <div fzButtonGroup aria-label="History"><button fzButton variant="outline">Undo</button><button fzButton variant="outline">Redo</button></div>
            }
            @case ('chips') {
              <fz-chip-listbox aria-label="Diet"><fz-chip value="vegan" label="Vegan" /><fz-chip value="halal" label="Halal" /></fz-chip-listbox>
            }
            @case ('close-button') { <button fzCloseButton aria-label="Close"></button> }
            @case ('combobox') { <input fzCombobox [options]="['Italy', 'Spain']" aria-label="Country" placeholder="Country" class="w-36!" /> }
            @case ('date-picker') { <fz-date-picker aria-label="Date" class="w-44!" /> }
            @case ('input') { <input fzInput aria-label="Name" placeholder="Name" class="w-36!" /> }
            @case ('input-group') {
              <div fzInputGroup class="w-36!"><span fzInputGroupAddon>€</span><input fzInputGroupInput aria-label="Price" value="12" /></div>
            }
            @case ('input-otp') { <fz-input-otp [length]="4" aria-label="Code" /> }
            @case ('multiselect') {
              <fz-multiselect aria-label="Fruit" placeholder="Fruit" class="w-36! min-w-0!"><fz-select-item value="apple" label="Apple" /></fz-multiselect>
            }
            @case ('pagination') { <fz-pagination [pageCount]="3" [label]="'Pagination ' + s" /> }
            @case ('select') {
              <fz-select aria-label="Plan" placeholder="Plan" class="w-36! min-w-0!"><fz-select-item value="free" label="Free" /></fz-select>
            }
            @case ('spinner') { <fz-spinner /> }
            @case ('tabs') {
              <div fzTabs>
                <ul fzTabList selectedTab="a" [attr.aria-label]="'Tabs ' + s">
                  <li fzTab value="a">Account</li>
                  <li fzTab value="b">Password</li>
                </ul>
                <div fzTabPanel value="a" class="sr-only"><ng-template ngTabContent>Account</ng-template></div>
                <div fzTabPanel value="b" class="sr-only"><ng-template ngTabContent>Password</ng-template></div>
              </div>
            }
            @case ('textarea') { <textarea fzTextarea aria-label="Message" placeholder="Message" class="w-36!"></textarea> }
            @case ('toggle') { <button fzToggle variant="outline" aria-label="Bold"><b>B</b></button> }
            @case ('toggle-group') {
              <div fzToggleGroup variant="outline" aria-label="Alignment">
                <button fzToggleGroupItem value="left">Left</button><button fzToggleGroupItem value="right">Right</button>
              </div>
            }
            @case ('toolbar') {
              <div fzToolbar aria-label="Formatting">
                <button fzToolbarItem aria-label="Bold"><b>B</b></button><button fzToolbarItem aria-label="Italic"><i>I</i></button>
              </div>
            }
          }
          <span class="font-mono text-xs text-muted-foreground">{{ s }}</span>
        </div>
      }
    </div>
  `,
})
export class Sizes {
  readonly name = input.required<string>();
  protected readonly sizes = ['xs', 'sm', 'md', 'lg'];
}
