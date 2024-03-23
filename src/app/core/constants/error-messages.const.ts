import { ValidationErrors } from "@angular/forms";

const ERROR_MESSAGES: { [key: string]: string | ((params: any) => string) } = {
    expenseMembersLength: 'Select at least 1 person',
    expenseMembersSum: ({actual, total}) => `Sum of expenses is not equal to the total amount.<br>Actual - ${actual}, expected - ${total}`,
    required: 'This field is required',
    differentRecipient: 'Sender and Recipient must be different people',
    minPeople: (min) => `Select at least ${min} ${min === 1 ? "person" : "people"}`,
    maxlength: ({ actualLength, requiredLength}) => `Max length is ${requiredLength}`,
    hasLinkedGoogleAccount: 'Please use your Google account to sign in',
    email: 'Please enter valid email',
    weekPassword: 'Password must be minimum 6 characters',
    passwordsNotMatch: 'Passwords do not match'
};

export function getErrorMessage(errors: ValidationErrors | null): string {
    if (errors === null) return '';

    const firstErrorKey = Object.keys(errors)[0];

    if (firstErrorKey && firstErrorKey in ERROR_MESSAGES) {
        const validationMessage = ERROR_MESSAGES[firstErrorKey];
        if (typeof validationMessage === "string") {
            return validationMessage;
        } else {
            return validationMessage(errors[firstErrorKey]);
        }
    }

    return '';
}
