import { FormGroup, Validators } from "@angular/forms";
import { MsFormControl } from "src/app/core/helpers/ms-form";
import { Expense, ExpenseMember } from "src/app/database/storage.interface";
import { ExpenseForm } from "./expense-form.interface";
import { expenseMembersValidator } from "./expense-members-control.validator";


export function getExpenseForm(defaultValue?: Omit<Expense, "id" | "groupId">) {
    const value = defaultValue || getDefaultFormValue();

    const amountControl = MsFormControl<number | null>(value.amount, [Validators.required]);

    function getTotalAmount(): number | null {
        return amountControl.value;
    }

    const form = new FormGroup<ExpenseForm>({
        title: MsFormControl<string>(value.title, {
            nonNullable: true,
            validators: Validators.required,
        }),
        amount: amountControl,
        date: MsFormControl<string>(value.date, {
            nonNullable: true,
        }),
        payers: MsFormControl<ExpenseMember[]>(value.payers, {
            nonNullable: true,
            validators: expenseMembersValidator(getTotalAmount),
        }),
        debtors: MsFormControl<ExpenseMember[]>(value.debtors, {
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
