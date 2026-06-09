import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageWrapper } from '../../components/page-wrapper/page-wrapper';
import { Cartas } from '../../interfaces/cartas';
import { TutorialService } from "../../services/tutorial.service";

@Component({
  selector: 'app-valores-carta',
  imports: [RouterLink, PageWrapper],
  templateUrl: './valores-carta.html',
  styleUrl: './valores-carta.css',
})

export class ValoresCarta implements OnInit {

  constructor(private tutorialService: TutorialService) {}
  cartas : Cartas[] = [];
  indiceInicio = 0;
  cantPagina = 8;

  ngOnInit(): void {
    this.cargarCartas();
  }

  cargarCartas(): void {
    this.tutorialService.obtenerCartas().subscribe({
      next: (cartas) =>{
        this.cartas = cartas;},
      error: (error) => {
        console.error('Error al cargar las cartas del truco:', error);
      } 
    });
  }

  siguiente(): void {
    if (this.indiceInicio + this.cantPagina < this.cartas.length) {
      this.indiceInicio += this.cantPagina;
    }
  }

  anterior(): void {
    if (this.indiceInicio > 0) {
      this.indiceInicio -= this.cantPagina;
    }
  }

}
