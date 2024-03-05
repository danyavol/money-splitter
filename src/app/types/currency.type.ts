import { Observable } from "rxjs";

export type ExtendedCurrency = Currency & {
    iconUrl$: Observable<string>;
    code: string;
};

export type Currency = {
    name: string;
    symbol: string;
    digits: number;
    icon: string;
    rate: number | null;
};
