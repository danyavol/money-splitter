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
import { DateHelper } from 'src/app/core/helpers/date-helper';
import { sortByDate } from 'src/app/core/helpers/helpers';
import { v4 as uuid } from 'uuid';
import { FullExpense, FullExpenseMember } from '../storage-join.interface';
import {
    Collection,
    Expense,
    ExpenseMember,
    Member,
} from '../storage.interface';
import { StorageService } from '../storage.service';
import { GroupsCollection } from './groups.collection';
import { MembersCollection } from './members.collection';

@Injectable({
    providedIn: 'root',
})
export class ExpensesCollection {
    private expensesSbj = new ReplaySubject<Expense[]>(1);
    expenses$ = this.expensesSbj.asObservable();

    constructor(
        private storage: StorageService,
        private membersCol: MembersCollection,
        private groupsCol: GroupsCollection
    ) {
        this.loadExpenses();
    }

    createExpense(expense: Omit<Expense, 'id'>): Observable<void> {
        const newExpense: Expense = { ...expense, id: uuid() };
        this.groupsCol.groupHasUpdated(expense.groupId).pipe(first()).subscribe();

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

    getGroupExpenses(groupId: string): Observable<Expense[]> {
        return this.expenses$.pipe(
            map((expenses) => expenses.filter((e) => e.groupId === groupId))
        );
    }

    getFullSortedExpenses(groupId: string): Observable<FullExpense[]> {
        return combineLatest([
            this.getGroupExpenses(groupId),
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
            ),
            map((expenses) => sortByDate(expenses))
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
                const expensesCopy = [...expenses];
                const expenseIndex = expenses.findIndex(
                    (e) => e.id === expenseId
                );
                if (expenseIndex < 0) return;

                this.groupsCol.groupHasUpdated(expenses[expenseIndex].groupId)
                    .pipe(first()).subscribe();

                expensesCopy.splice(expenseIndex, 1, {
                    ...expensesCopy[expenseIndex],
                    ...expense,
                });
                return expensesCopy;
            }),
            switchMap((newExpenses) => {
                if (!newExpenses) return of();

                return this.saveExpenses(newExpenses).pipe(
                    tap(() => this.expensesSbj.next(newExpenses))
                );
            })
        );
    }

    removeExpense(expenseId: string): Observable<void> {
        return this.expenses$.pipe(
            first(),
            map((expenses) => {
                const expensesCopy = [...expenses];
                const expenseIndex = expensesCopy.findIndex(
                    (e) => e.id === expenseId
                );
                if (expenseIndex < 0) return;

                this.groupsCol.groupHasUpdated(expenses[expenseIndex].groupId)
                    .pipe(first()).subscribe();

                expensesCopy.splice(expenseIndex, 1);
                return expensesCopy;
            }),
            switchMap((newExpenses) => {
                if (!newExpenses) return of();

                return this.saveExpenses(newExpenses).pipe(
                    tap(() => this.expensesSbj.next(newExpenses))
                );
            })
        );
    }

    removeAllGroupExpenses(groupId: string): Observable<void> {
        return this.expenses$.pipe(
            first(),
            switchMap(expenses => {
                const newExpenses = expenses.filter(e => e.groupId !== groupId);

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
        this.storage.refresh$
            .pipe(
                startWith(undefined),
                switchMap(() =>
                    this.storage.get<Expense[]>(Collection.Expenses)
                )
            )
            .subscribe((expenses) => {
                const mappedExpenses = (expenses || []).map((expense) => ({
                    ...expense,
                    date: DateHelper.utcToLocal(expense.date),
                }));
                this.expensesSbj.next(mappedExpenses);
            });
    }

    private saveExpenses(expenses: Expense[]): Observable<void> {
        const mappedExpenses = expenses.map((expense) => ({
            ...expense,
            date: DateHelper.localToUtc(expense.date),
        }));
        return this.storage.set(Collection.Expenses, mappedExpenses);
    }
}
