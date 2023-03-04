import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Expense, ExpenseMember } from "src/app/database/storage.interface";
import { ExpenseForm } from "./interfaces/expense-form.interface";
import { expenseMembersValidator } from "./validators/expense-members-control.validator";


export function getExpenseForm(defaultValue?: Omit<Expense, "id" | "groupId">) {
    const value = defaultValue || getDefaultFormValue();

    const amountControl = new FormControl<number | null>(value.amount);

    function getTotalAmount(): number | null {
        return amountControl.value;
    }

    const form = new FormGroup<ExpenseForm>({
        title: new FormControl<string>(value.title, {
            nonNullable: true,
            validators: Validators.required,
        }),
        amount: amountControl,
        date: new FormControl<string>(value.date, {
            nonNullable: true,
        }),
        payers: new FormControl<ExpenseMember[]>(value.payers, {
            nonNullable: true,
            validators: expenseMembersValidator(getTotalAmount),
        }),
        debtors: new FormControl<ExpenseMember[]>(value.debtors, {
            nonNullable: true,
            validators: expenseMembersValidator(getTotalAmount),
        }),
    });

    return form;
}

function getDefaultFormValue(): Omit<Expense, "id" | "groupId"> {
    return {
        title: "",
        amount: null,
        date: getCurrentDate(),
        payers: [],
        debtors: []
    };
}

function getCurrentDate(): string {
    // TODO: Fix date
    const date = new Date();
    date.setSeconds(0, 0);
    return date.toISOString();
}
