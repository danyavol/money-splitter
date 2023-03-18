import { data, code } from 'currency-codes';
import IMask from 'imask';

export const Currency = {
    list: data.map((currency) => ({
        value: currency.code,
        title: `${currency.code} - ${currency.currency}`,
    })),
    format(currencyCode: string, number: number): string {
        return new Intl.NumberFormat(getLocale(currencyCode), {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: code(currencyCode)?.digits
        }).format(number);
    },
    round(currencyCode: string, number: number): number {
        const currencyInfo = code(currencyCode);
        if (!currencyInfo) return number;

        return Math.round(number * (10 ** currencyInfo.digits)) / (10 ** currencyInfo.digits);
    },
    getMaskConfig(currencyCode: string): IMask.MaskedNumberOptions {
        return  {
            mask: Number, // enable number mask

            // other options are optional with defaults below
            scale: code(currencyCode)?.digits ?? 2, // digits after point, 0 for integers
            signed: true, // disallow negative
            thousandsSeparator: ' ', // any single char
            padFractionalZeros: true, // if true, then pads zeros at end to the length of scale
            normalizeZeros: true, // appends or removes zeros at ends
            radix: '.', // fractional delimiter
            mapToRadix: [','], // symbols to process as radix
        }
    },
    getPlaceholder(currencyCode: string): string {
        const digits = code(currencyCode)?.digits ?? 2;
        return digits > 0 ? `0.${"0".repeat(digits)}` : '0';
    }
};

function getLocale(currencyCode: string): string {
    switch (currencyCode) {
        case "PLN": return "pl-PL";
        case "EUR": return "pl-PL";
        default: return "en-US";
    }
}
