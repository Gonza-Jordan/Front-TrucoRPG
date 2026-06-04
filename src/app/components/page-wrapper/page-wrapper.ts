import { Component } from '@angular/core';

@Component({
  selector: 'app-page-wrapper',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './page-wrapper.css'
})
export class PageWrapper {}
