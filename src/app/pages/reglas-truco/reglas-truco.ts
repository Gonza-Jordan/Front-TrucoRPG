import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageWrapper } from '../../components/page-wrapper/page-wrapper';
import { Reglas } from '../../interfaces/reglas';
import { TutorialService } from "../../services/tutorial.service";

@Component({
  selector: 'app-reglas-truco',
  imports: [RouterLink, PageWrapper],
  templateUrl: './reglas-truco.html',
  styleUrl: './reglas-truco.css',
})
export class ReglasTruco implements OnInit {

  constructor(private tutorialService: TutorialService) {}

  pasoActual = 0;
  reglas : Reglas[] = [];

  ngOnInit(): void {
    this.cargarReglas();
  }

  cargarReglas(): void {
    this.tutorialService.obtenerReglas().subscribe({
      next: (reglas) =>{
        this.reglas = reglas;
      },
      error: (error) => {
        console.error('Error al cargar las reglas del truco:', error);
      }
    });
  }

 
  siguiente(): void {
    if (this.pasoActual < this.reglas.length - 1) {
      this.pasoActual++;
    }
  }

  anterior(): void {
    if (this.pasoActual > 0) {
      this.pasoActual--;
    }
  }

}
