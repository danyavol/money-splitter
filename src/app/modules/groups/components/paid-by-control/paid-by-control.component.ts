import { Component, Input, ViewChild } from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
    BehaviorSubject,
    combineLatest,
    map,
    Observable,
    withLatestFrom,
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
    @Input() set totalAmount(value: number | null) {
        this.totalAmount$.next(value);
    }
    @Input() currency: Currency | null = null;
    @Input() label: string = '';

    @ViewChild('selectPerson') select?: SelectPersonComponent;

    totalAmount$ = new BehaviorSubject<number | null>(null);
    inputMembers$ = new BehaviorSubject<Member[]>([]);
    inputExpenseMembers$ = new BehaviorSubject<ExpenseMember[]>([]);

    onChange = (value: ExpenseMember[]) => {};
    onTouched = () => {};

    expenseMembers$ = new BehaviorSubject<ExpenseMember[]>([]);

    selectedMemberIds = new FormControl<string[]>([], { nonNullable: true });
    amountControl = new FormControl<number>(0, {});

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

        // Total amount change handler
        this.totalAmount$
            .pipe(withLatestFrom(this.expenseMembers$))
            .subscribe(([totalAmount, expenseMembers]) => {
                if (expenseMembers.length > 0) {
                    this.calculateAmounts(
                        this.getExpenseMembersCopy(),
                        totalAmount
                    );
                    this.triggerOnChange();
                }
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
                                  amount: null,
                                  ration: null,
                              };
                    })
                )
            )
            .subscribe((expenseMembers) => {
                this.expenseMembers$.next(expenseMembers);
                this.calculateAmounts(
                    this.getExpenseMembersCopy(),
                    this.totalAmount$.value,
                    true
                );
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
        const newMember = this.getExpenseMemberCopy(memberId);

        if (newMember.ration === null) return;

        if (newMember.ration <= 1) {
            newMember.ration = null;
            newMember.amount = null;
        } else {
            newMember.ration--;
        }

        this.updateExpenseMember(newMember);
        this.calculateAmounts(
            this.getExpenseMembersCopy(),
            this.totalAmount$.value,
        );
        this.triggerOnChange();
    }

    increaseRation(memberId: string): void {
        const newMember = this.getExpenseMemberCopy(memberId);

        if (newMember.ration === 99) return;

        if (newMember.ration === null) {
            newMember.ration = 1;
        } else {
            newMember.ration++;
        }

        this.updateExpenseMember(newMember);
        this.calculateAmounts(
            this.getExpenseMembersCopy(),
            this.totalAmount$.value
        );
        this.triggerOnChange();
    }

    amountChange(amount: number | null, memberId: string): void {
        const newMember = this.getExpenseMemberCopy(memberId);

        newMember.amount = amount;
        newMember.ration = null;

        this.updateExpenseMember(newMember);
        this.calculateAmounts(
            this.getExpenseMembersCopy(),
            this.totalAmount$.value
        );
        this.triggerOnChange();
    }

    trackByFn(_index: number, member: ViewMember): string {
        return member.memberId;
    }

    private calculateAmounts(
        expenseMembers: ExpenseMember[],
        totalAmount: number | null,
        resetNonRationMembers = false
    ): void {
        // If only one user selected - he will pay everything
        if (expenseMembers.length === 1) {
            expenseMembers[0].amount = totalAmount;
            expenseMembers[0].ration = null;
            this.expenseMembers$.next(expenseMembers);
            return;
        }

        const { totalRation, totalAmountWithoutRation } = expenseMembers.reduce(
            (total, member) => {
                if (member.ration) total.totalRation += member.ration;

                if (!member.ration) {
                    if (resetNonRationMembers)
                        member.amount = null;
                    total.totalAmountWithoutRation += member.amount || 0;
                }

                return total;
            },
            { totalRation: 0, totalAmountWithoutRation: 0 }
        );

        totalAmount = (totalAmount || 0) - totalAmountWithoutRation;
        if (totalAmount < 0) totalAmount = 0;

        const oneRationAmount = totalRation ? totalAmount / totalRation : 0;

        const membersTotal = this.roundNumber(
            expenseMembers.reduce((membersTotal, member) => {
                if (member.ration) {
                    member.amount = this.roundNumber(
                        member.ration * oneRationAmount
                    );
                    return membersTotal + member.amount;
                }
                return membersTotal;
            }, 0)
        );

        if (membersTotal !== totalAmount && totalRation > 0) {
            const calculationError = totalAmount - membersTotal + totalAmountWithoutRation;
            const firstMember = expenseMembers[0];
            firstMember.amount = this.roundNumber(
                (firstMember.amount || 0) + calculationError
            );
        }

        this.expenseMembers$.next(expenseMembers);
    }

    private roundNumber(num: number): number {
        return Math.round(num * 100) / 100;
    }

    private getExpenseMemberCopy(memberId: string): ExpenseMember {
        return {
            ...this.expenseMembers$.value.find((m) => m.memberId === memberId)!,
        };
    }

    private getExpenseMembersCopy(): ExpenseMember[] {
        return [...this.expenseMembers$.value.map((m) => ({ ...m }))];
    }

    private updateExpenseMember(member: ExpenseMember): void {
        const value = [...this.expenseMembers$.value];

        const index = value.findIndex((m) => m.memberId === member.memberId);
        value.splice(index, 1, member);

        this.expenseMembers$.next(value);
    }

    private triggerOnChange(): void {
        this.onChange(this.expenseMembers$.value.map((m) => ({ ...m })));
    }
}
