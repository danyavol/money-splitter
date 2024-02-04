import { Component, Input, OnInit, forwardRef } from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
    BehaviorSubject,
    combineLatest,
    map,
    Observable,
    withLatestFrom,
} from 'rxjs';
import { Currency } from 'src/app/core/constants/currencies.const';
import { Member } from 'src/app/database/storage.interface';
import { ExpenseMemberValue } from '../../expense-form.interface';

interface ViewMember extends ExpenseMemberValue {
    name: string;
}

@UntilDestroy()
@Component({
    selector: 'app-expense-members-control',
    templateUrl: './expense-members-control.component.html',
    styleUrls: ['./expense-members-control.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => ExpenseMembersControlComponent),
        },
    ],
})
export class ExpenseMembersControlComponent implements ControlValueAccessor, OnInit {
    static counter = 0;
    controlId = ExpenseMembersControlComponent.counter++;

    @Input() set members(value: Member[]) {
        this.inputMembers$.next(value);
    }
    @Input() set totalAmount(value: number | null) {
        this.totalAmount$.next(value);
    }
    @Input() currency!: string;
    @Input() label: string = '';

    totalAmount$ = new BehaviorSubject<number | null>(null);
    inputMembers$ = new BehaviorSubject<Member[]>([]);
    inputExpenseMembers$ = new BehaviorSubject<ExpenseMemberValue[]>([]);
    placeholder: string = '';

    onChange = (value: ExpenseMemberValue[]) => {};
    onTouched = () => {};

    expenseMembers$ = new BehaviorSubject<ExpenseMemberValue[]>([]);

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

    ngOnInit(): void {
        this.placeholder = Currency.getPlaceholder(this.currency);

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
                }),
                untilDestroyed(this)
            )
            .subscribe((expenseMembers) => {
                this.expenseMembers$.next(expenseMembers);
                this.selectedMemberIds.setValue(
                    expenseMembers.map((m) => m.memberId)
                );
            });

        // Total amount change handler
        this.totalAmount$
            .pipe(
                withLatestFrom(this.expenseMembers$),
                untilDestroyed(this)
            )
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
                                  ration: 1,
                              };
                    })
                ),
                untilDestroyed(this)
            )
            .subscribe((expenseMembers) => {
                this.expenseMembers$.next(expenseMembers);
                this.calculateAmounts(
                    this.getExpenseMembersCopy(),
                    this.totalAmount$.value
                );
                this.triggerOnChange();
            });
    }

    writeValue(value: ExpenseMemberValue[]): void {
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
            this.totalAmount$.value
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
            this.totalAmount$.value,
            newMember.memberId
        );
        this.triggerOnChange();
    }

    trackByFn(_index: number, member: ViewMember): string {
        return member.memberId;
    }

    private calculateAmounts(
        expenseMembers: ExpenseMemberValue[],
        totalAmount: number | null,
        ignoredMember?: string
    ): void {
        // If only one user selected - he will pay everything
        if (expenseMembers.length === 1) {
            if (!ignoredMember || expenseMembers[0].memberId !== ignoredMember) {
                expenseMembers[0].amount = totalAmount;
            }
            this.expenseMembers$.next(expenseMembers);
            return;
        }

        const { totalRation, totalAmountWithoutRation } = expenseMembers.reduce(
            (total, member) => {
                if (member.ration) total.totalRation += member.ration;

                if (!member.ration) {
                    total.totalAmountWithoutRation += member.amount || 0;
                }

                return total;
            },
            { totalRation: 0, totalAmountWithoutRation: 0 }
        );

        totalAmount = (totalAmount || 0) - totalAmountWithoutRation;
        if (totalAmount < 0) totalAmount = 0;

        const oneRationAmount = totalRation ? totalAmount / totalRation : 0;

        const membersTotal = Currency.round(this.currency,
            expenseMembers.reduce((membersTotal, member) => {
                if (member.ration) {
                    member.amount = Currency.round(this.currency,
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
            firstMember.amount = Currency.round(this.currency,
                (firstMember.amount || 0) + calculationError
            );
        }

        this.expenseMembers$.next(expenseMembers);
    }

    private getExpenseMemberCopy(memberId: string): ExpenseMemberValue {
        return {
            ...this.expenseMembers$.value.find((m) => m.memberId === memberId)!,
        };
    }

    private getExpenseMembersCopy(): ExpenseMemberValue[] {
        return [...this.expenseMembers$.value.map((m) => ({ ...m }))];
    }

    private updateExpenseMember(member: ExpenseMemberValue): void {
        const value = [...this.expenseMembers$.value];

        const index = value.findIndex((m) => m.memberId === member.memberId);
        value.splice(index, 1, member);

        this.expenseMembers$.next(value);
    }

    private triggerOnChange(): void {
        this.onChange(this.expenseMembers$.value.map((m) => ({ ...m })));
    }
}
