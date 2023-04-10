import {
    Directive,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewContainerRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import IMask from 'imask';
import { ReplaySubject } from 'rxjs';
import { Currency } from '../constants/currencies.const';

@UntilDestroy()
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
        this.valueSbj.next(value);
    }
    @Output() maskValueChange = new EventEmitter<number | null>();

    private valueSbj = new ReplaySubject<number | null>(1);
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

        this.valueSbj.pipe(untilDestroyed(this)).subscribe(v => this.setMaskValue(v));
    }

    writeValue(value: number | null): void {
        this.valueSbj.next(value);
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

            if (value === 0) {
                this.skipNextValueChange = true;
                this.mask.value = '';
            }
        } else if (value === null && this.mask.value !== '') {
            this.skipNextValueChange = true;
            this.mask.value = '';
        }
    }
}
