import { Currency } from "../core/interfaces/currency.interface";

export enum Collection {
    Groups = "groups",
    Members = "members",
    Expenses = "expenses",
    Transfers = "transfers",
    Settings = "settings"
}

export interface Group {
    id: string;
    name: string;
    members: string[];
    currency: Currency;
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
    date: string;
    title: string;
    amount: number | null; // TODO: Why it can be null?
}

export interface ExpenseMember {
    memberId: string;
    ration: number | null;
    amount: number | null;
}

export interface Transfer {
    id: string;
    groupId: string;
    senderId: string;
    recipientId: string;
    date: string;
    title: string;
    amount: number;
}

export interface Settings {
    theme: Theme;
}

export enum Theme {
    System = "system",
    Dark = "dark",
    Light = "light"
}
