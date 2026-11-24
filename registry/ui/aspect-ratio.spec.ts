import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzAspectRatio } from './aspect-ratio';

@Component({
  imports: [FzAspectRatio],
  template: `<div fzAspectRatio="16 / 9" id="wide"><img alt="" /></div><div [fzAspectRatio]="1" id="square"></div><div fzAspectRatio="4 / 3" id="photo"></div>`,
})
class Host {}

describe('FzAspectRatio', () => {
  it('sets CSS aspect-ratio', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector<HTMLElement>('#wide')!.style.aspectRatio).toBe('16 / 9');
    // a number (#square) is checked in Chrome: jsdom's CSS parser rejects a bare aspect-ratio number
    expect(el.querySelector<HTMLElement>('#photo')!.style.aspectRatio).toBe('4 / 3');
  });
});
