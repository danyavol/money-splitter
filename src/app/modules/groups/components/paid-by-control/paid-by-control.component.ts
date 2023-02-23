import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Currency } from 'src/app/core/interfaces/currency.interface';
import { ExpenseMember, Member } from 'src/app/database/storage.interface';

interface ExtendedMember extends ExpenseMember {
    name: string;
}

@Component({
    selector: 'app-paid-by-control',
    templateUrl: './paid-by-control.component.html',
    styleUrls: ['./paid-by-control.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: PaidByControlComponent,
        },
    ],
})
export class PaidByControlComponent implements ControlValueAccessor {
    @Input() set members(value: Member[]) {
        this.members$.next(value);
    }
    @Input() totalAmount: number = 0;
    @Input() currency: Currency | null = null;

    onChange = () => {};
    onTouched = () => {};

    members$ = new BehaviorSubject<Member[]>([]);
    expenseMembers$ = new BehaviorSubject<ExpenseMember[]>([]);

    extendedMembers$: Observable<ExtendedMember[]> = combineLatest([
        this.members$,
        this.expenseMembers$,
    ]).pipe(
        map(([members, expenseMembers]) =>
            expenseMembers.map((m) => ({
                ...m,
                name:
                    members.find((member) => member.id === m.memberId)?.name ||
                    '',
            }))
        )
    );

    writeValue(value: ExpenseMember[]): void {
        this.expenseMembers$.next(value);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    // setDisabledState?(isDisabled: boolean): void {
    //     throw new Error('Method not implemented.');
    // }
}
