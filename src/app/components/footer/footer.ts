import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  constructor(public router: Router) {}

  get isGameRoute(): boolean {
    return this.router.url.includes('/jugar');
  }
}
