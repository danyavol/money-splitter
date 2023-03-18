import { FormGroup, Validators } from "@angular/forms";
import { DateHelper } from "src/app/core/helpers/date-helper";
import { MsFormControl } from "src/app/core/helpers/ms-form";
import { ExpenseForm, ExpenseFormValue, ExpenseMemberValue } from "./expense-form.interface";
import { expenseMembersValidator } from "./expense-members-control.validator";

export function getExpenseForm(currencyCode: string, defaultValue?: Omit<ExpenseFormValue, "id" | "groupId">) {
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
        payers: MsFormControl<ExpenseMemberValue[]>(value.payers, {
            nonNullable: true,
            validators: expenseMembersValidator(currencyCode, getTotalAmount),
        }),
        debtors: MsFormControl<ExpenseMemberValue[]>(value.debtors, {
            nonNullable: true,
            validators: expenseMembersValidator(currencyCode, getTotalAmount),
        }),
    });

    return form;
}

function getDefaultFormValue(): Omit<ExpenseFormValue, "id" | "groupId"> {
    return {
        title: "",
        amount: null,
        date: DateHelper.getCurrentLocalDate(),
        payers: [],
        debtors: []
    };
}
