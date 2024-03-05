import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { ExtendedCurrency } from 'src/app/types/currency.type';
import { MsFormControl } from '../../helpers/ms-form';
import { ButtonComponent } from '../button/button.component';
import { AutofocusDirective } from '../../directives/autofocus.directive';

@Component({
    selector: 'app-select-currency-modal',
    templateUrl: './select-currency-modal.component.html',
    styleUrls: ['./select-currency-modal.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, ScrollingModule, ButtonComponent, ReactiveFormsModule, AutofocusDirective],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => SelectCurrencyModalComponent),
        },
    ],
})
export class SelectCurrencyModalComponent implements OnInit, AfterViewInit, ControlValueAccessor {
    @Input() currencies$!: Observable<ExtendedCurrency[]>;

    @Output() close = new EventEmitter<void>();

    search = MsFormControl('');
    filteredCurrencies$!: Observable<ExtendedCurrency[]>;
    selectedCurrency: string | null = null;
    onChange = (value: string | null | string[]) => {};
    onTouched = () => {};

    constructor(private elementRef: ElementRef) {}

    ngOnInit(): void {
        this.filteredCurrencies$ = combineLatest([
            this.currencies$,
            this.search.valueChanges.pipe(startWith(this.search.value))
        ]).pipe(
            map(([currencies, search]) => {
                const searchValue = search.trim().toLowerCase();
                if (!searchValue) return currencies;

                return currencies.filter(c =>
                    c.code.toLowerCase().includes(searchValue) ||
                    c.name.toLowerCase().includes(searchValue)
                );
            })
        );
    }

    ngAfterViewInit() {
        setTimeout(() => {
            const selected = this.elementRef.nativeElement.querySelector(".selected");
            if (selected) selected.scrollIntoView({ block: "center" });
        });
    }

    currencySelected(currencyCode: string): void {
        this.onChange(currencyCode);
        this.onTouched();
        this.close.emit();
    }

    trackByFn(_index: number, currency: ExtendedCurrency): string {
        return currency.code;
    }

    writeValue(value: string | null): void {
        this.selectedCurrency = value;
    }

    registerOnChange(fn: (value: string | null | string[]) => void): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
}
