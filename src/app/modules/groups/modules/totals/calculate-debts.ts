import { Currency } from 'src/app/core/constants/currencies.const';
import { Expense, Transfer } from 'src/app/database/storage.interface';
import clone from 'just-clone';

export interface Debt {
    from: string;
    to: string;
    amount: number;
}

enum TriangleType {
    Circular,
    NonCircular
}

interface CircularTriangle {
    type: TriangleType.Circular,
    debts: [Debt, Debt, Debt]
}

interface NonCircularTriangle {
    type: TriangleType.NonCircular,
    debts: {
        firstToSecond: Debt,
        firstToThird: Debt,
        secondToThird: Debt,
    }
}

type Triangle = CircularTriangle | NonCircularTriangle;

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

// This function will filter complex cases to decrease amount of transactions between people.
//
// If there are 3 people and they all have debts between each other (Triangle),
// than it is always possible to reduce amount of transactions between them from 3 to 2
//
// Triangle could be either Circular (1 -> 2, 2 -> 3, 3 -> 1)
// or NonCircular (1 -> 2, 1 -> 3, 2 -> 3)
function optimizeTriangleDebts(currencyCode: string, debts: Debt[]): Debt[] {
    const debtsCopy = [...debts.map(d => ({...d}))];

    // Find debt triangles, which can be optimized
    findTriangles(debtsCopy).forEach(triangle => {
        // Circular triangle type.
        // We just reduce every transaction by the lowest transaction amount
        if (triangle.type === TriangleType.Circular) {
            let lowestDebt = triangle.debts[0];
            [triangle.debts[1], triangle.debts[2]].forEach(d => {
                if (lowestDebt.amount > d.amount) {
                    lowestDebt = d;
                }
            });
            const lowestAmount = lowestDebt.amount;
            triangle.debts.forEach(d => {
                d.amount = Currency.round(currencyCode, d.amount - lowestAmount)
            });
        }
        // NonCircular triangle type.
        // There could be 2 ways of resolving such situantion,
        // depending on amount of firstToSecond and firstToThird transactions
        else {
            const { firstToSecond, firstToThird, secondToThird } = triangle.debts;
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
    });

    // After optimization some of the debts might be negative or zero.
    // We should clean such debts
    return cleanUpAfterTrianglesOptimization(debtsCopy);
}

function findTriangles(debts: Debt[]): Triangle[] {
    const adjacencySet = debtsToAdjacencySet(debts);
    const vertices = Array.from(adjacencySet.keys());
    const n = vertices.length;
    const triangles: any[] = [];

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (!adjacencySet.get(vertices[i])!.has(vertices[j])) continue;

            for (let k = j + 1; k < n; k++) {
                if (
                    adjacencySet.get(vertices[i])!.has(vertices[k]) &&
                    adjacencySet.get(vertices[j])!.has(vertices[k])
                ) {
                    const triangleConns = [
                        [vertices[i], vertices[j]],
                        [vertices[i], vertices[k]],
                        [vertices[j], vertices[k]]
                    ];

                    const triangleDebts = triangleConns.map(connection =>
                        debts.find(d => connection.includes(d.from) && connection.includes(d.to))!
                    ) as [Debt, Debt, Debt];

                    const trianglePoints: [string, string, string] = [vertices[i], vertices[j], vertices[k]];


                    const triangle = determineTriangleType(triangleDebts, trianglePoints);
                    triangles.push(triangle);
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

function determineTriangleType(debts: [Debt, Debt, Debt], points: [string, string, string]): Triangle {
    const sortedPoints: string[] = [];
    points.forEach((point) => {
         // value could be 0, 1 or 2
        const inCount = debts.filter(d => d.to === point).length;
        sortedPoints[inCount] = point;
    });

    if (!sortedPoints[0] && !sortedPoints[2]) {
        // Circular dependency (0 -> 1, 1 -> 2, 2 -> 0) or (0 <- 1, 1 <- 2, 2 <- 0)
        return {
            type: TriangleType.Circular,
            debts
        };
    } else {
        // Non-Circular dependency (0 -> 1, 0 -> 2, 1 -> 2)
        return {
            type: TriangleType.NonCircular,
            debts: {
                firstToSecond: debts.find(d => d.from === sortedPoints[0] && d.to === sortedPoints[1])!,
                firstToThird: debts.find(d => d.from === sortedPoints[0] && d.to === sortedPoints[2])!,
                secondToThird: debts.find(d => d.from === sortedPoints[1] && d.to === sortedPoints[2])!,
            }
        };
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
