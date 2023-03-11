import { Expense, ExpenseMember, Transfer } from "./storage.interface";

export interface FullExpenseMember extends ExpenseMember {
    name: string;
}

export interface FullExpense extends Expense {
    payers: FullExpenseMember[];
    debtors: FullExpenseMember[];
}

export interface FullTransfer extends Transfer {
    sender: string;
    recipient: string;
}
