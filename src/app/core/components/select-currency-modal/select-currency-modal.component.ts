import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Observable, combineLatest, first, map, shareReplay, startWith } from 'rxjs';
import { ExtendedCurrency } from 'src/app/types/currency.type';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { MsFormControl } from '../../helpers/ms-form';
import { ButtonComponent } from '../button/button.component';
import { StaticVirtualScrollDirective } from '../../directives/static-virtual-scroll.directive';
import { StaticVirtualScrollStrategy } from '../../helpers/static-virtual-scroll-strategy';

@Component({
    selector: 'app-select-currency-modal',
    templateUrl: './select-currency-modal.component.html',
    styleUrls: ['./select-currency-modal.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, ScrollingModule, ButtonComponent, ReactiveFormsModule, AutofocusDirective, StaticVirtualScrollDirective],
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
    @ViewChild(StaticVirtualScrollStrategy) list!: StaticVirtualScrollStrategy;

    search = MsFormControl('');
    filteredCurrencies$!: Observable<ExtendedCurrency[]>;
    selectedCurrency: string | null = null;
    onChange = (value: string | null | string[]) => {};
    onTouched = () => {};

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
            }),
            shareReplay(1)
        );
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.filteredCurrencies$.pipe(first()).subscribe(c => {
                const index = c.findIndex(cur => cur.code === this.selectedCurrency);
                this.list.scrollToIndex(index, undefined, 'center');
            });
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
