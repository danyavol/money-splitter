import { roundNumber } from 'src/app/core/helpers/helpers';
import { Expense, Transfer } from 'src/app/database/storage.interface';

export interface Debt {
    from: string;
    to: string;
    amount: number;
}

interface DebtTriangle {
    startPerson: string,
    endPerson: string,
    middlePerson: string
}

export function calculateDebts(
    expenses: Expense[],
    transfers: Transfer[]
): Debt[] {
    let debts = mapToDebts(expenses, transfers);

    debts = filterSimpleCases(debts);
    debts = filterEachOtherOwes(debts);
    debts = optimizeTriangleDebts(debts);

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
    debts.forEach((debt) => {
        // #1 Remove self-debts
        if (debt.from === debt.to) return;

        // #2 Combine debts with the same "from" and "to" to 1 single debt
        const existingDebt = newDebts.find(
            (d) => d.from === debt.from && d.to === debt.to
        );
        if (existingDebt) {
            existingDebt.amount = roundNumber(
                existingDebt.amount + debt.amount
            );
        } else {
            newDebts.push({ ...debt });
        }
    });
    return newDebts;
}

// This function will filter out all cases, when two people owe each other
function filterEachOtherOwes(debts: Debt[]): Debt[] {
    const newDebts: Debt[] = [];
    debts.forEach((debt) => {
        const oppositeDebt = newDebts.find(
            (d) => d.from === debt.to && d.to === debt.from
        );
        if (oppositeDebt) {
            if (debt.amount > oppositeDebt.amount) {
                const from = oppositeDebt.from;
                oppositeDebt.from = oppositeDebt.to;
                oppositeDebt.to = from;
                oppositeDebt.amount = roundNumber(
                    debt.amount - oppositeDebt.amount
                );
            } else {
                oppositeDebt.amount = roundNumber(
                    oppositeDebt.amount - debt.amount
                );
            }
        } else {
            newDebts.push({ ...debt });
        }
    });
    return newDebts;
}

// This function will filter complex cases to decrease amount of transactions between people
// Example: Imagine that there are 3 people (P1, P2, P3)
// P1 owes to P2, P1 owes to P3, P2 owes to P3
// In such case we can reduce 1 transaction (either "P1 to P2" or "P1 to P3", depends on amount)
//
// Definitions:
// StartPerson - person, who has 2 OUT transactions
// EndPerson - person, who has 2 IN transactions
// MiddlePerson - persom, who has 1 IN and 1 OUT transaction
function optimizeTriangleDebts(debts: Debt[]): Debt[] {
    const debtsCopy = [...debts.map(d => ({...d}))];

    // Find debt triangles, which can be optimized
    findTriangles(debtsCopy).forEach(triangle => {
        const firstToSecond = debtsCopy.find(d => d.from === triangle.startPerson && d.to === triangle.middlePerson);
        const firstToThird = debtsCopy.find(d => d.from === triangle.startPerson && d.to === triangle.endPerson);
        const secondToThird = debtsCopy.find(d => d.from === triangle.middlePerson && d.to === triangle.endPerson);

        if (!firstToSecond || !firstToThird || !secondToThird) {
            throw Error("Something went wrong, missing debt");
        }

        if (firstToThird.amount <= firstToSecond.amount) {
            firstToSecond.amount = roundNumber(firstToSecond.amount + firstToThird.amount);
            secondToThird.amount = roundNumber(secondToThird.amount + firstToThird.amount);
            firstToThird.amount = 0;
        } else {
            firstToThird.amount = roundNumber(firstToThird.amount + firstToSecond.amount);
            secondToThird.amount = roundNumber(secondToThird.amount - firstToSecond.amount);
            firstToSecond.amount = 0;
        }
    });

    // After optimization some of the debts might be negative or zero
    // We should clean such debts
    return cleanUpAfterTrianglesOptimization(debtsCopy);
}

function findTriangles(debts: Debt[]): DebtTriangle[] {
    const adjacencySet = debtsToAdjacencySet(debts);
    const vertices = Array.from(adjacencySet.keys());
    const n = vertices.length;
    const triangles: DebtTriangle[] = [];

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (!adjacencySet.get(vertices[i])!.has(vertices[j])) continue;

            for (let k = j + 1; k < n; k++) {
                if (
                    adjacencySet.get(vertices[i])!.has(vertices[k]) &&
                    adjacencySet.get(vertices[j])!.has(vertices[k])
                ) {
                    triangles.push({
                        startPerson: vertices[k],
                        middlePerson: vertices[i],
                        endPerson: vertices[j]
                    });
                }
            }
        }
    }

    return triangles;

    function debtsToAdjacencySet(debts: Debt[]) {
        const adjacencySet = new Map<string, Set<string>>();

        for (const debt of debts) {
            if (!adjacencySet.has(debt.from)) {
                adjacencySet.set(debt.from, new Set());
            }
            if (!adjacencySet.has(debt.to)) {
                adjacencySet.set(debt.to, new Set());
            }
            adjacencySet.get(debt.from)!.add(debt.to);
            adjacencySet.get(debt.to)!.add(debt.from);
        }

        return adjacencySet;
    }
}

function cleanUpAfterTrianglesOptimization(debts: Debt[]): Debt[] {
    return debts.filter(d => d.amount !== 0).map(d => {
        if (d.amount < 0) {
            return {
                from: d.to,
                to: d.from,
                amount: -d.amount
            };
        }
        return {...d};
    });
}