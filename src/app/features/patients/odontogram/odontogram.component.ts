import { Component, ElementRef, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
export interface CuadranteDental {
  id: number;
  position: number;
  name: string;
  asset: string
}

const dentalIzqSuperior: CuadranteDental[] = [
  {id: 11, position: 11, name:'incisivo_central_izq_sup', asset:'/odontogram-elements/incisivo_central.png'},
  {id: 12, position: 12, name:'incisivo_lateral_izq_sup', asset:'/odontogram-elements/incisivo_lateral.png'},
  {id: 13, position: 13, name:'canino_izq_sup', asset:'/odontogram-elements/canino.png'},
  {id: 14, position: 14, name:'primer_premolar_izq_sup', asset:'/odontogram-elements/primer_premolar.png'},
  {id: 15, position: 15, name:'segundo_premolar_izq_sup', asset:'/odontogram-elements/segundo_premolar.png'},
  {id: 16, position: 16, name:'primer_molar_izq_sup', asset:'/odontogram-elements/primer_molar.png'},
  {id: 17, position: 17, name:'segundo_molar_izq_sup', asset:'/odontogram-elements/segundo_molar.png'},
  {id: 18, position: 18, name:'tercer_molar_izq_sup', asset:'/odontogram-elements/tercer_molar.png'}
]

const dentalDerSuperior: CuadranteDental[] = [
  {id: 21, position: 21, name:'incisivo_central_der_sup', asset:'/odontogram-elements/incisivo_central.png'},
  {id: 22, position: 22, name:'incisivo_lateral_der_sup', asset:'/odontogram-elements/incisivo_lateral.png'},
  {id: 23, position: 23, name:'canino_der_sup', asset:'/odontogram-elements/canino.png'},
  {id: 24, position: 24, name:'primer_premolar_der_sup', asset:'/odontogram-elements/primer_premolar.png'},
  {id: 25, position: 25, name:'segundo_premolar_der_sup', asset:'/odontogram-elements/segundo_premolar.png'},
  {id: 26, position: 26, name:'primer_molar_der_sup', asset:'/odontogram-elements/primer_molar.png'},
  {id: 27, position: 27, name:'segundo_molar_der_sup', asset:'/odontogram-elements/segundo_molar.png'},
  {id: 28, position: 28, name:'tercer_molar_der_sup', asset:'/odontogram-elements/tercer_molar.png'}
]

const dentalIZqInferior: CuadranteDental[] = [
  {id: 41, position: 41, name:'incisivo_central_izq_inf', asset:'/odontogram-elements/incisivo_central.png'},
  {id: 42, position: 42, name:'incisivo_lateral_izq_inf', asset:'/odontogram-elements/incisivo_lateral.png'},
  {id: 43, position: 43, name:'canino_izq_inf', asset:'/odontogram-elements/canino.png'},
  {id: 44, position: 44, name:'primer_premolar_izq_inf', asset:'/odontogram-elements/primer_premolar.png'},
  {id: 45, position: 45, name:'segundo_premolar_izq_inf', asset:'/odontogram-elements/segundo_premolar.png'},
  {id: 46, position: 46, name:'primer_molar_izq_inf', asset:'/odontogram-elements/primer_molar.png'},
  {id: 47, position: 47, name:'segundo_molar_izq_inf', asset:'/odontogram-elements/segundo_molar.png'},
  {id: 48, position: 48, name:'tercer_molar_izq_inf', asset:'/odontogram-elements/tercer_molar.png'}
]

const dentalDerInferior: CuadranteDental[] = [
  {id: 31, position: 31, name:'incisivo_central_der_inf', asset:'/odontogram-elements/incisivo_central.png'},
  {id: 32, position: 32, name:'incisivo_lateral_der_inf', asset:'/odontogram-elements/incisivo_lateral.png'},
  {id: 33, position: 33, name:'canino_der_inf', asset:'/odontogram-elements/canino.png'},
  {id: 34, position: 34, name:'primer_premolar_der_inf', asset:'/odontogram-elements/primer_premolar.png'},
  {id: 35, position: 35, name:'segundo_premolar_der_inf', asset:'/odontogram-elements/segundo_premolar.png'},
  {id: 36, position: 36, name:'primer_molar_der_inf', asset:'/odontogram-elements/primer_molar.png'},
  {id: 37, position: 37, name:'segundo_molar_der_inf', asset:'/odontogram-elements/segundo_molar.png'},
  {id: 38, position: 38, name:'tercer_molar_der_infp', asset:'/odontogram-elements/tercer_molar.png'}
]

@Component({
  selector: 'app-odontogram',
  standalone: true,
  imports: [
    NavBarComponent,
    MatIconModule,
    MatRadioModule,
    MatButtonModule
  ],
  templateUrl: './odontogram.component.html',
  styleUrl: './odontogram.component.scss'
})
export class OdontogramComponent {
  dentalIzqSuperior = dentalIzqSuperior.reverse()
  dentalDerSuperior = dentalDerSuperior
  dentalIzqInferior = dentalIZqInferior.reverse()
  dentalDerInferior = dentalDerInferior
  fillColor: String = "yellow";
  fill: any
  htmlString: string = ''
  nativo: any;
  @ViewChild(TemplateRef, { static: true }) odontoTemplate: TemplateRef<any> | undefined;
  @ViewChild(TemplateRef, { static: true, read: ViewContainerRef })
  odontoContainer: ViewContainerRef | undefined;
  constructor(private elementRef: ElementRef){}
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#ffffff';
    //this.odontoContainer.createEmbeddedView(this.odontoTemplate);
  }

  ngOnInit(): void {}


  changeColor(lado: HTMLElement) {
    this.fill = this.fillColor;
    const attr = lado?.attributes?.getNamedItem("fill")
    if (attr !== null) {
      const namedItem = lado.attributes.getNamedItem("fill");
      if (namedItem !== null) {
        namedItem.value = this.fill;
      }
    }
  }

  generateToothNumber(limit: number): number{
    return 0
  }

  amarillo() {
    this.fillColor = "yellow";
  }

  rojo() {
    this.fillColor = "red";
  }
}
