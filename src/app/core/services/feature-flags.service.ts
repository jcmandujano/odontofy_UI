import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  readonly patientOdontogram = environment.features.patientOdontogram;
}
