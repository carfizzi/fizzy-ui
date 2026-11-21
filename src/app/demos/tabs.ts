import { Component, signal } from '@angular/core';
import { FZ_TABS } from '../../../registry/ui/tabs';

@Component({
  imports: [FZ_TABS],
  template: `
    <div fzTabs class="w-full max-w-md">
      <ul fzTabList [(selectedTab)]="tab">
        <li fzTab value="account">Account</li>
        <li fzTab value="password">Password</li>
        <li fzTab value="billing" disabled>Billing</li>
      </ul>
      <div fzTabPanel value="account"><ng-template ngTabContent>Make changes to your account here.</ng-template></div>
      <div fzTabPanel value="password"><ng-template ngTabContent>Change your password here.</ng-template></div>
      <div fzTabPanel value="billing"><ng-template ngTabContent>Billing.</ng-template></div>
    </div>
  `,
})
export class Demo {
  protected readonly tab = signal<string | undefined>('account');
}
