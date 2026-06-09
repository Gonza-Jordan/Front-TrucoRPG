import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageWrapper } from '../../components/page-wrapper/page-wrapper';
import { Reglas } from '../../interfaces/reglas';
import { TutorialService } from "../../services/tutorial.service";
import { Cartas } from '../../interfaces/cartas';

@Component({
  selector: 'app-tutorial',
  imports: [RouterLink, PageWrapper],
  templateUrl: './tutorial.html',
  styleUrl: './tutorial.css',
})
export class Tutorial implements OnInit {

constructor(private tutorialService: TutorialService) {}

  pasoActual = 0;
  
  reglas : Reglas[] = [];
  cartas : Cartas[] = [];

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

  cargarCartas(): void {
    this.tutorialService.obtenerCartas().subscribe({
      next: (cartas) =>{
        this.cartas = cartas;},
      error: (error) => {
        console.error('Error al cargar las cartas del truco:', error);
      } 
    });
  }


  siguiente():void{
    if(this.pasoActual === 0){
      this.pasoActual = 1;
      this.cargarCartas();
    }
  }

  anterior():void{
    if(this.pasoActual === 1){
      this.pasoActual = 0;
      this.cargarReglas();
    } 
  }

}
