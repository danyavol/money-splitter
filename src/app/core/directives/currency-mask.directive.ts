import {
    Directive,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewContainerRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import IMask from 'imask';
import { Currency } from '../constants/currencies.const';

@Directive({
    selector: '[currencyMask]',
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CurrencyMaskDirective,
            multi: true,
        },
    ],
})
export class CurrencyMaskDirective implements ControlValueAccessor, OnInit {
    @Input() currencyMaskCode: string = "USD";
    @Input() set maskValue(value: number | null) {
        this.setMaskValue(value);
    }
    @Output() maskValueChange = new EventEmitter<number | null>();

    private element: HTMLInputElement;
    private skipNextValueChange = false;
    private mask!: IMask.InputMask<IMask.MaskedNumberOptions>;
    private _onChange: (value: any) => void = () => {};
    private _onTouched: () => void = () => {};

    constructor(ref: ViewContainerRef) {
        this.element = ref.element.nativeElement;
        this.element.addEventListener("blur", () => this._onTouched());
    }

    ngOnInit(): void {
        this.mask = IMask(this.element, Currency.getMaskConfig(this.currencyMaskCode));
        this.mask.on('accept', () => {
            if (this.skipNextValueChange) {
                this.skipNextValueChange = false;
                return;
            }

            const newValue = !this.mask!.value ? null : this.mask!.typedValue;
            this._onChange(newValue);
            this._onTouched();
            this.maskValueChange.emit(newValue);
        });
    }

    writeValue(value: number | null): void {
        this.setMaskValue(value);
    }

    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.element.disabled = isDisabled;
    }

    private setMaskValue(value: number | null) {
        if (!this.mask) return;

        if (typeof value === 'number' && this.mask.typedValue !== value) {
            this.skipNextValueChange = true;
            this.mask.typedValue = value;
        } else if (value === null && this.mask.value !== '') {
            this.skipNextValueChange = true;
            this.mask.value = '';
        }
    }
}
