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

  private readonly mapaNumeros: Record<number, number> = {
    1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 10: 8, 11: 9, 12: 10
  };
  private readonly offsetPalo: Record<string, number> = {
    Oro: 0, Copa: 10, Espada: 20, Basto: 30
  };

  cardImg(carta: Cartas): string {
    return `assets/cards/${this.offsetPalo[carta.palo] + this.mapaNumeros[carta.numero]}.PNG`;
  }

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
