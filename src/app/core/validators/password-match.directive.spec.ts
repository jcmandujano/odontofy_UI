import { FormControl, FormGroup } from '@angular/forms';
import { passwordMatchValidator } from './password-match.directive';

describe('passwordMatchValidator', () => {
  it('marks a mismatched confirmation', () => {
    const form = new FormGroup({
      newPassword: new FormControl('one'),
      confirmPassword: new FormControl('two')
    });

    expect(passwordMatchValidator(form)).toEqual({ passwordMismatch: true });
    expect(form.controls.confirmPassword.hasError('passwordMismatch')).toBeTrue();
  });
});
