import { Expense, ExpenseMember } from "./storage.interface";

export interface FullExpenseMember extends ExpenseMember {
    name: string;
}

export interface FullExpense extends Expense {
    payers: FullExpenseMember[];
    debtors: FullExpenseMember[];
}
