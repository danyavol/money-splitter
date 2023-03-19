import { Currency } from 'src/app/core/constants/currencies.const';
import { Expense, Transfer } from 'src/app/database/storage.interface';
import clone from 'just-clone';

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
    currencyCode: string,
    expenses: Expense[],
    transfers: Transfer[]
): Debt[] {
    let debts = mapToDebts(currencyCode, expenses, transfers);

    debts = filterSimpleCases(currencyCode, debts);
    debts = filterEachOtherOwes(currencyCode, debts);
    debts = optimizeTriangleDebts(currencyCode, debts);

    return debts;
}

function flattenExpense(currencyCode: string, expense: Expense): Debt[] {
    const debts: Debt[] = [];
    const expenseCopy = clone(expense);

    const payersToRemove: string[] = [], debtorsToRemove: string[] = [];
    expenseCopy.payers.forEach((payer) => {
        const debtor = expenseCopy.debtors.find(d => d.memberId === payer.memberId);
        // Person is payer and debtor at the same time, move him to the one of the categories
        if (debtor) {
            if (payer.amount > debtor.amount) {
                payer.amount = Currency.round(currencyCode, payer.amount - debtor.amount);
                debtorsToRemove.push(debtor.memberId);
            } else if (debtor.amount > payer.amount) {
                debtor.amount = Currency.round(currencyCode, debtor.amount - payer.amount);
                payersToRemove.push(payer.memberId);
            } else {
                payersToRemove.push(payer.memberId);
                debtorsToRemove.push(debtor.memberId);
            }
        }
    });

    expenseCopy.debtors = expenseCopy.debtors.filter(d => !debtorsToRemove.includes(d.memberId));
    expenseCopy.payers = expenseCopy.payers.filter(d => !payersToRemove.includes(d.memberId));

    const totalAmount = Currency.round(currencyCode, expenseCopy.payers.reduce((total, payer) => total + payer.amount, 0));
    const payers: { payerId: string; amount: number; percentage: number }[] =
    expenseCopy.payers.map((payer) => ({
            payerId: payer.memberId,
            amount: payer.amount,
            percentage: payer.amount / totalAmount,
        }));

        expenseCopy.debtors.forEach((debtor) => {
        payers.reduce((totalReturned, payer, currentIndex) => {
            let amount: number;
            if (currentIndex === payers.length - 1) {
                amount = Currency.round(currencyCode, debtor.amount - totalReturned);
            } else {
                amount = Currency.round(currencyCode, debtor.amount * payer.percentage);
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

function mapToDebts(currencyCode: string, expenses: Expense[], transfers: Transfer[]): Debt[] {
    return [
        ...expenses.reduce(
            (debts, expense) => [...debts, ...flattenExpense(currencyCode, expense)],
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
function filterSimpleCases(currencyCode: string, debts: Debt[]): Debt[] {
    const newDebts: Debt[] = [];
    debts.forEach((debt) => {
        // #1 Remove self-debts
        if (debt.from === debt.to) return;

        // #2 Combine debts with the same "from" and "to" to 1 single debt
        const existingDebt = newDebts.find(
            (d) => d.from === debt.from && d.to === debt.to
        );
        if (existingDebt) {
            existingDebt.amount = Currency.round(currencyCode,
                existingDebt.amount + debt.amount
            );
        } else {
            newDebts.push({ ...debt });
        }
    });
    return newDebts;
}

// This function will filter out all cases, when two people owe each other
function filterEachOtherOwes(currencyCode: string, debts: Debt[]): Debt[] {
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
                oppositeDebt.amount = Currency.round(currencyCode,
                    debt.amount - oppositeDebt.amount
                );
            } else {
                oppositeDebt.amount = Currency.round(currencyCode,
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
function optimizeTriangleDebts(currencyCode: string, debts: Debt[]): Debt[] {
    const debtsCopy = [...debts.map(d => ({...d}))];

    // Find debt triangles, which can be optimized
    findTriangles(debtsCopy).forEach(triangle => {
        const firstToSecond = debtsCopy.find(d => d.from === triangle.startPerson && d.to === triangle.middlePerson);
        const firstToThird = debtsCopy.find(d => d.from === triangle.startPerson && d.to === triangle.endPerson);
        const secondToThird = debtsCopy.find(d => d.from === triangle.middlePerson && d.to === triangle.endPerson);
        const thirdToFirst = debtsCopy.find(d => d.from == triangle.endPerson && d.to === triangle.startPerson)

        if (firstToSecond && secondToThird && thirdToFirst) {
            // Circular dependency (1 -> 2, 2 -> 3, 3 -> 1)
            let lowestDebt = firstToSecond;
            [secondToThird, thirdToFirst].forEach(d => {
                if (lowestDebt.amount > d.amount) {
                    lowestDebt = d;
                }
            });
            const lowestAmount = lowestDebt.amount;
            [firstToSecond, secondToThird,thirdToFirst].forEach(d => {
                d.amount = Currency.round(currencyCode, d.amount - lowestAmount)
            });
        }
        else if(firstToSecond && firstToThird && secondToThird) {
            // Default dependency (1 -> 2, 1 -> 3, 2 -> 3)
            if (firstToThird.amount <= firstToSecond.amount) {
                firstToSecond.amount = Currency.round(currencyCode, firstToSecond.amount + firstToThird.amount);
                secondToThird.amount = Currency.round(currencyCode, secondToThird.amount + firstToThird.amount);
                firstToThird.amount = 0;
            } else {
                firstToThird.amount = Currency.round(currencyCode, firstToThird.amount + firstToSecond.amount);
                secondToThird.amount = Currency.round(currencyCode, secondToThird.amount - firstToSecond.amount);
                firstToSecond.amount = 0;
            }
        }
        else {
            throw Error("[Calculate debts]: Something went wrong, missing debt");
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
