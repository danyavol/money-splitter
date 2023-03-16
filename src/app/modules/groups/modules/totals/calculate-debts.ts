import { roundNumber } from 'src/app/core/helpers/helpers';
import { Expense, Transfer } from 'src/app/database/storage.interface';

interface Debt {
    from: string;
    to: string;
    amount: number;
}

export function calculateDebts(expenses: Expense[], transfers: Transfer[]): Debt[] {
    let debts = mapToDebts(expenses, transfers);

    debts = filterSimpleCases(debts);
    debts = filterEachOtherOwes(debts);

    return debts;
}

function flattenExpense(expense: Expense): Debt[] {
    const debts: Debt[] = [];

    const payers: { payerId: string; amount: number; percentage: number }[] =
        expense.payers.map((payer) => ({
            payerId: payer.memberId,
            amount: payer.amount,
            percentage: payer.amount / expense.amount,
        }));

    expense.debtors.forEach((debtor) => {
        payers.reduce((totalReturned, payer, currentIndex) => {
            let amount: number;
            if (currentIndex === payers.length - 1) {
                amount = roundNumber(debtor.amount - totalReturned);
            } else {
                amount = roundNumber(debtor.amount * payer.percentage);
            }
            debts.push({
                from: debtor.memberId,
                to: payer.payerId,
                amount: amount,
            });

            return totalReturned + amount;
        }, 0);
    });

    return debts;
}

function mapToDebts(expenses: Expense[], transfers: Transfer[]): Debt[] {
    return [
        ...expenses.reduce(
            (debts, expense) => [...debts, ...flattenExpense(expense)],
            [] as Debt[]
        ),
        ...transfers.map((t) => ({
            from: t.recipientId,
            to: t.senderId,
            amount: t.amount,
        })),
    ];
}

// This function will filter the most simple cases
function filterSimpleCases(debts: Debt[]): Debt[] {
    const newDebts: Debt[] = [];
    debts.forEach(debt => {
        // #1 Remove self-debts
        if (debt.from === debt.to) return;

        // #2 Combine debts with the same "from" and "to" to 1 single debt
        const existingDebt = newDebts.find(d => d.from === debt.from && d.to === debt.to);
        if (existingDebt) {
            existingDebt.amount = roundNumber(existingDebt.amount + debt.amount);
        } else {
            newDebts.push({...debt});
        }
    });
    return newDebts;
}

// This function will filter out all cases, when two people owe each other
function filterEachOtherOwes(debts: Debt[]): Debt[] {
    const newDebts: Debt[] = [];
    debts.forEach(debt => {
        const oppositeDebt = newDebts.find(d => d.from === debt.to && d.to === debt.from);
        if (oppositeDebt) {
            if (debt.amount > oppositeDebt.amount) {
                const from = oppositeDebt.from;
                oppositeDebt.from = oppositeDebt.to;
                oppositeDebt.to = from;
                oppositeDebt.amount = roundNumber(debt.amount - oppositeDebt.amount);
            } else {
                oppositeDebt.amount = roundNumber(oppositeDebt.amount - debt.amount);
            }
        } else {
            newDebts.push({...debt});
        }
    })
    return newDebts;
}
