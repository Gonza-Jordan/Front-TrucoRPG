import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageWrapper } from '../../components/page-wrapper/page-wrapper';

@Component({
  selector: 'app-tutorial',
  imports: [RouterLink, PageWrapper],
  templateUrl: './tutorial.html',
  styleUrl: './tutorial.css',
})
export class Tutorial {

  pasoActual: number = 0;

  pasos = [
    {
      titulo: 'Reglas del truco',
      contenido: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellendus illo consectetur iusto, eveniet vel, incidunt similique in assumenda inventore amet magnam. Illum repellendus inventore voluptates deleniti, nisi dicta distinctio nesciunt.'
    },
    {
      titulo: 'Valores de las cartas',
      contenido: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellendus illo consectetur iusto, eveniet vel, incidunt similique in assumenda inventore amet magnam. Illum repellendus inventore voluptates deleniti, nisi dicta distinctio nesciunt.'
    }
  ];

  siguiente():void{
    if(this.pasoActual < this.pasos.length - 1){
      this.pasoActual++;
    }
  }

  anterior():void{
    if(this.pasoActual > 0){
      this.pasoActual--;
    } 
  }

}
