import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './card.css'
})
export class Card {
  @Input() maxWidth = '460px';

  @HostBinding('style.width')
  get hostWidth() { return `min(${this.maxWidth}, 90vw)`; }
}
