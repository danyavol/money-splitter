import { Component, Input, ViewChild } from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import {
    BehaviorSubject,
    combineLatest,
    map,
    Observable, withLatestFrom
} from 'rxjs';
import { SelectPersonComponent } from 'src/app/core/components/select-person/select-person.component';
import { Currency } from 'src/app/core/interfaces/currency.interface';
import { ExpenseMember, Member } from 'src/app/database/storage.interface';

interface ViewMember extends ExpenseMember {
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
        this.inputMembers$.next(value);
    }
    @Input() totalAmount: number = 0;
    @Input() currency: Currency | null = null;
    @Input() label: string = '';

    @ViewChild('selectPerson') select?: SelectPersonComponent;

    inputMembers$ = new BehaviorSubject<Member[]>([]);
    inputExpenseMembers$ = new BehaviorSubject<ExpenseMember[]>([]);

    onChange = (value: ExpenseMember[]) => {};
    onTouched = () => {};

    expenseMembers$ = new BehaviorSubject<ExpenseMember[]>([]);

    selectedMemberIds = new FormControl<string[]>([], { nonNullable: true });
    amountControl = new FormControl<number>(0, {})

    viewMembers$: Observable<ViewMember[]> = this.expenseMembers$.pipe(
        withLatestFrom(this.inputMembers$),
        map(([expenseMembers, members]) =>
            expenseMembers.map((expenseMember) => ({
                ...expenseMember,
                name: members.find((m) => m.id === expenseMember.memberId)!
                    .name,
            }))
        )
    );

    constructor() {
        // Inputs change handler
        combineLatest([this.inputMembers$, this.inputExpenseMembers$])
            .pipe(
                map(([members, expenseMembers]) => {
                    // Members and expenseMembers must have corresponding items
                    return expenseMembers.filter(
                        (expenseMember) =>
                            !!members.find(
                                (member) => member.id === expenseMember.memberId
                            )
                    );
                })
            )
            .subscribe((expenseMembers) => {
                this.expenseMembers$.next(expenseMembers);
                this.selectedMemberIds.setValue(
                    expenseMembers.map((m) => m.memberId)
                );
            });

        // Update expenseMembers based on selected Ids
        this.selectedMemberIds.valueChanges
            .pipe(
                map((ids) =>
                    ids.map((id) => {
                        const existingMember = this.expenseMembers$.value.find(
                            (m) => m.memberId === id
                        );
                        return existingMember
                            ? existingMember
                            : {
                                  memberId: id,
                                  amount: 0,
                                  ration: null,
                              };
                    })
                )
            )
            .subscribe((expenseMembers) => {
                this.expenseMembers$.next(expenseMembers);
                this.triggerOnChange();
            });
    }

    writeValue(value: ExpenseMember[]): void {
        this.inputExpenseMembers$.next(value);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    decreaseRation(memberId: string): void {
        const newMember = this.findExpenseMember(memberId);

        if (newMember.ration === null) return;

        if (newMember.ration <= 1) {
            newMember.ration = null;
        } else {
            newMember.ration--;
        }

        this.updateExpenseMember(newMember);
    }

    increaseRation(memberId: string): void {
        const newMember = this.findExpenseMember(memberId);

        if (newMember.ration === 99) return;

        if (newMember.ration === null)  {
            newMember.ration = 1;
        } else {
            newMember.ration++;
        }

        this.updateExpenseMember(newMember);
    }

    amountChange(amount: number, memberId: string): void {
        const newMember = this.findExpenseMember(memberId);

        newMember.amount = amount;

        this.updateExpenseMember(newMember);
    }

    trackByFn(_index: number, member: ViewMember): string {
        return member.memberId;
    }

    private findExpenseMember(memberId: string): ExpenseMember {
        return {
            ...this.expenseMembers$.value.find((m) => m.memberId === memberId)!,
        };
    }

    private updateExpenseMember(member: ExpenseMember): void {
        const value = [...this.expenseMembers$.value];

        const index = value.findIndex(
            (m) => m.memberId === member.memberId
        );
        value.splice(index, 1, member);

        this.expenseMembers$.next(value);
        this.triggerOnChange();
    }

    private triggerOnChange(): void {
        console.log('emitCurrentValue');
        this.onChange(this.expenseMembers$.value.map((m) => ({ ...m })));
    }
}
