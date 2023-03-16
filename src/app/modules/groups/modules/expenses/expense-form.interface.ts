import { FormControl } from "@angular/forms";

export interface ExpenseForm {
    title: FormControl<string>;
    amount: FormControl<number | null>;
    date: FormControl<string>;
    payers: FormControl<ExpenseMemberValue[]>;
    debtors: FormControl<ExpenseMemberValue[]>;
}

export interface ExpenseFormValue {
    id: string;
    groupId: string;
    payers: ExpenseMemberValue[];
    debtors: ExpenseMemberValue[];
    date: string;
    title: string;
    amount: number | null;
}

export interface ExpenseMemberValue {
    memberId: string;
    ration: number | null;
    amount: number | null;
}
