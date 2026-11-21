import { Directive } from '@angular/core';

@Directive({ selector: '[fzCard]', host: { class: 'flex flex-col gap-6 rounded-lg border bg-background py-6 text-foreground shadow-sm' } })
export class FzCard {}

@Directive({ selector: '[fzCardHeader]', host: { class: 'flex flex-col gap-1.5 px-6' } })
export class FzCardHeader {}

@Directive({ selector: '[fzCardTitle]', host: { class: 'font-semibold leading-none' } })
export class FzCardTitle {}

@Directive({ selector: '[fzCardDescription]', host: { class: 'text-sm text-muted-foreground' } })
export class FzCardDescription {}

@Directive({ selector: '[fzCardContent]', host: { class: 'px-6' } })
export class FzCardContent {}

@Directive({ selector: '[fzCardFooter]', host: { class: 'flex items-center gap-2 px-6' } })
export class FzCardFooter {}

export const FZ_CARD = [FzCard, FzCardHeader, FzCardTitle, FzCardDescription, FzCardContent, FzCardFooter] as const;
