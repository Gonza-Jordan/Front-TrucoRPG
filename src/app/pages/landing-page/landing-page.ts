import { Component, OnDestroy, OnInit } from '@angular/core';
import { Header } from "../../components/header/header";
import { Footer } from "../../components/footer/footer";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [Header, Footer, RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {

}
