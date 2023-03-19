import { Component, Input, OnChanges } from '@angular/core';
import { FullExpense } from 'src/app/database/storage-join.interface';
import { flattenExpense } from '../../calculate-debts';

interface ExpenseDebt {
    personName: string;
    amount: number;
}

@Component({
    selector: 'app-expense-total',
    templateUrl: './expense-total.component.html',
    styleUrls: ['./expense-total.component.scss'],
})
export class ExpenseTotalComponent implements OnChanges {
    @Input() personId!: string;
    @Input() currency!: string;
    @Input() expense!: FullExpense;

    myDebts: ExpenseDebt[] = [];
    myGetsBack: ExpenseDebt[] = [];
    payedAmount = 0;

    ngOnChanges() {
        // TODO: Optimize
        this.calculateDebts(this.expense);
    }

    private calculateDebts(expense: FullExpense) {
        const debts = flattenExpense(this.currency, expense);
        const members = this.getExpenseMembers(expense);

        this.payedAmount = expense.payers.find(p => p.memberId === this.personId)?.amount || 0;

        this.myDebts = debts.filter(d => d.from === this.personId).map(d => ({
            personName: members.get(d.to)!,
            amount: d.amount
        }));

        this.myGetsBack = debts.filter(d => d.to === this.personId).map(d => ({
            personName: members.get(d.from)!,
            amount: d.amount
        }));
    }

    private getExpenseMembers(expense: FullExpense): Map<string, string> {
        const map = new Map<string, string>();

        [...expense.debtors, ...expense.payers].forEach(p => {
            map.set(p.memberId, p.name);
        });

        return map;
    }
}
