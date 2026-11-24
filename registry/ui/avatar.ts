import { Component, input, linkedSignal } from '@angular/core';

type FzSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Shows `src` once it has loaded; until then, or if it fails, shows `fallback` (e.g. initials).
 * Use `alt=""` when a visible name sits next to the avatar.
 */
@Component({
  selector: 'fz-avatar',
  host: { class: 'relative flex size-(--fz-avatar) shrink-0 overflow-hidden rounded-full', '[attr.data-size]': 'size() ?? null' },
  template: `
    @if (src() && status() !== 'error') {
      <img
        [src]="src()"
        [alt]="alt()"
        (load)="status.set('loaded')"
        (error)="status.set('error')"
        class="aspect-square size-full object-cover"
        [class.hidden]="status() !== 'loaded'"
      />
    }
    @if (status() !== 'loaded') {
      <span
        [attr.role]="alt() ? 'img' : null"
        [attr.aria-label]="alt() || null"
        [attr.aria-hidden]="alt() ? null : 'true'"
        class="flex size-full items-center justify-center bg-muted text-[length:calc(var(--fz-avatar)*0.44)] text-muted-foreground"
      >
        {{ fallback() }}
      </span>
    }
  `,
})
export class FzAvatar {
  readonly src = input<string>();
  readonly alt = input.required<string>();
  readonly fallback = input('');
  /** xs, sm, md, lg (its own scale in fizzy.css). Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
  // A new src starts loading again.
  protected readonly status = linkedSignal<string | undefined, 'loading' | 'loaded' | 'error'>({
    source: this.src,
    computation: () => 'loading',
  });
}

export const FZ_AVATAR = [FzAvatar] as const;
