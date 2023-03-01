import { FormControl } from "@angular/forms";
import { ExpenseMember } from "src/app/database/storage.interface";

export interface ExpenseForm {
    title: FormControl<string>;
    amount: FormControl<number | null>;
    date: FormControl<string>;
    payers: FormControl<ExpenseMember[]>;
    debtors: FormControl<ExpenseMember[]>;
}
