import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const parseCurrencyValue = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const normalizedValue = String(value ?? '').replace(/[^0-9.-]+/g, '');
  const numericValue = Number.parseFloat(normalizedValue);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

export const formatCurrencyValue = (value: unknown, currency = 'MXN'): string =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseCurrencyValue(value));

@Directive({
  selector: 'input[appCurrencyInput]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputDirective),
      multi: true,
    },
  ],
})
export class CurrencyInputDirective implements ControlValueAccessor {
  @Input() currencyCode = 'MXN';

  private value = 0;
  private onChange: (value: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(
    private readonly elementRef: ElementRef<HTMLInputElement>,
    private readonly renderer: Renderer2
  ) {}

  @HostListener('input')
  handleInput(): void {
    this.value = parseCurrencyValue(this.elementRef.nativeElement.value);
    this.onChange(this.value);
  }

  @HostListener('focus')
  handleFocus(): void {
    if (this.elementRef.nativeElement.readOnly) return;
    this.setInputValue(this.value.toFixed(2));
  }

  @HostListener('blur')
  handleBlur(): void {
    this.onTouched();
    this.setInputValue(formatCurrencyValue(this.value, this.currencyCode));
  }

  writeValue(value: unknown): void {
    this.value = parseCurrencyValue(value);
    this.setInputValue(formatCurrencyValue(this.value, this.currencyCode));
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }

  private setInputValue(value: string): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
  }
}
