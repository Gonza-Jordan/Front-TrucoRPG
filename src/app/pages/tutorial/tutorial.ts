import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageWrapper } from '../../components/page-wrapper/page-wrapper';

@Component({
  selector: 'app-tutorial',
  imports: [RouterLink, PageWrapper],
  templateUrl: './tutorial.html',
  styleUrl: './tutorial.css',
})
export class Tutorial  {

}
