import { FormControl } from "@angular/forms";
import { Currency } from "src/app/core/interfaces/currency.interface";

export interface GroupForm {
    name: FormControl<string>;
    members: FormControl<string[]>;
    currency: FormControl<Currency>;
}
