import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-no-data-found',
    imports: [
        MatIconModule,
        MatCardModule
    ],
    templateUrl: './no-data-found.component.html',
    styleUrl: './no-data-found.component.scss'
})
export class NoDataFoundComponent {
  @Input()
  title!: string;
  @Input()
  message!: string;
  @Input()
  icon!: string;


}
