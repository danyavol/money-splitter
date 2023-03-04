import { Injectable } from '@angular/core';
import {
    combineLatest,
    first,
    map,
    Observable,
    of,
    ReplaySubject,
    startWith,
    switchMap,
    tap,
} from 'rxjs';
import { v4 as uuid } from 'uuid';
import { FullExpense, FullExpenseMember } from '../storage-join.interface';
import {
    Collection,
    Expense,
    ExpenseMember,
    Member,
} from '../storage.interface';
import { StorageService } from '../storage.service';
import { MembersCollection } from './members.collection';

@Injectable({
    providedIn: 'root',
})
export class ExpensesCollection {
    private expensesSbj = new ReplaySubject<Expense[]>(1);
    expenses$ = this.expensesSbj.asObservable();

    constructor(
        private storage: StorageService,
        private membersCol: MembersCollection
    ) {
        this.loadExpenses();
    }

    createExpense(expense: Omit<Expense, 'id'>): Observable<void> {
        const newExpense: Expense = { ...expense, id: uuid() };

        return this.expenses$.pipe(
            first(),
            map((expenses) => [...expenses, newExpense]),
            switchMap((newExpenses) =>
                this.saveExpenses(newExpenses).pipe(
                    tap(() => this.expensesSbj.next(newExpenses))
                )
            )
        );
    }

    getFullExpenses(groupId: string): Observable<FullExpense[]> {
        return combineLatest([
            this.expenses$.pipe(
                map((expenses) => expenses.filter((e) => e.groupId === groupId))
            ),
            this.membersCol.members$,
        ]).pipe(
            map(([expenses, members]) =>
                expenses.map((e) => ({
                    ...e,
                    payers: e.payers.map((p) =>
                        this.getFullExpenseMember(p, members)
                    ),
                    debtors: e.debtors.map((d) =>
                        this.getFullExpenseMember(d, members)
                    ),
                }))
            )
        );
    }

    getExpense(expenseId: string): Observable<Expense | null> {
        return this.expenses$.pipe(
            first(),
            map((expenses) => expenses.find((e) => e.id === expenseId) || null)
        );
    }

    updateExpense(
        expenseId: string,
        expense: Partial<Expense>
    ): Observable<void> {
        return this.expenses$.pipe(
            first(),
            map((expenses) => {
                const expenseIndex = expenses.findIndex(
                    (e) => e.id === expenseId
                );
                if (expenseIndex < 0) return;

                expenses.splice(expenseIndex, 1, {
                    ...expenses[expenseIndex],
                    ...expense,
                });
                return expenses;
            }),
            switchMap((newExpenses) => {
                if (!newExpenses) return of();

                return this.saveExpenses(newExpenses).pipe(
                    tap(() => this.expensesSbj.next(newExpenses))
                );
            })
        );
    }

    private getFullExpenseMember(
        member: ExpenseMember,
        members: Member[]
    ): FullExpenseMember {
        const memberName = members.find((m) => m.id === member.memberId)?.name;
        if (!memberName)
            throw Error(`Member not found. Id: ${member.memberId}`);

        return { ...member, name: memberName };
    }

    private loadExpenses(): void {
        this.storage.refresh$.pipe(
            startWith(undefined),
            switchMap(() => this.storage.get<Expense[]>(Collection.Expenses))
        ).subscribe(expenses => {
            this.expensesSbj.next(expenses || []);
        });
    }

    private saveExpenses(expenses: Expense[]): Observable<void> {
        return this.storage.set(Collection.Expenses, expenses);
    }
}
