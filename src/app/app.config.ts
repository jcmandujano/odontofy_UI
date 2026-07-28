import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TitleCasePipe } from '@angular/common';
import { interceptorFn } from './core/interceptors/interceptor.service';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { LocalIconRegistryService } from './core/services/local-icon-registry.service';

import 'moment/locale/es'; // Asegúrate de importar el locale en español

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([interceptorFn])),
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideAnimationsAsync(), 
    provideAppInitializer(() => inject(LocalIconRegistryService).registerIcons()),
    provideMomentDateAdapter(), // Usa Moment.js como adaptador global
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' }, // Aplica la localización globalmente
    TitleCasePipe]
};
