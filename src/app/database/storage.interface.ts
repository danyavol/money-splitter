export enum Collection {
    Groups = "groups",
    Members = "members",
    Expenses = "expenses",
    Transfers = "transfers"
}

export interface Group {
    id: string;
    name: string;
    members: string[];
    currency: string;
}

export interface Member {
    id: string;
    name: string;
}

export interface Expense {
    id: string;
    groupId: string;
    payers: ExpenseMember[];
    debtors: ExpenseMember[];
    date: Date;
    title: string;
    amount: number;
}

export interface ExpenseMember {
    memberId: string;
    amount: number;
}

export interface Transfer {
    id: string;
    groupId: string;
    senderId: string;
    recipientId: string;
    title: string;
    amount: number;
}
