import { Component,inject,signal } from '@angular/core';
import { RouterModule,ActivatedRoute,NavigationEnd,Router,RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  headerType = signal('');

 constructor() {

  this.router.events
    .pipe(
      filter(event => event instanceof NavigationEnd)
    )
    .subscribe(() => {

      let currentRoute = this.router.routerState.root;

      while (currentRoute.firstChild) {
        currentRoute = currentRoute.firstChild;
      }

      const data = currentRoute.snapshot.data;

      console.log('DATA:', data);

      this.headerType.set(data['header'] || 'default');

      console.log('HEADER TYPE:', this.headerType());

    });

}

}