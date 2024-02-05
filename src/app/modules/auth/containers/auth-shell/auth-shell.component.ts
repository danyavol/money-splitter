import { Component } from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, debounceTime, distinctUntilChanged, first, map, startWith, switchMap } from 'rxjs';
import { MsFormControl } from 'src/app/core/helpers/ms-form';
import { AuthService } from 'src/app/core/services/auth.service';

function hasNoGoogleAccount(authService: AuthService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return control.valueChanges.pipe(
            startWith(control.value),
            debounceTime(150),
            distinctUntilChanged(),
            switchMap((email) =>
                authService
                    .getSignInMethods(email)
                    .pipe(
                        map((method) =>
                            method === 'google'
                                ? { hasLinkedGoogleAccount: true }
                                : null
                        )
                    )
            ),
            first()
        );
    };
}

/**
 * If you firstly created an account using email and password,
 * and then logged in via Google linked to the same email,
 * your first account will be merged with the new account and now you will only be able
 * to log in via Google.
 */

@Component({
    selector: 'app-auth-shell',
    templateUrl: './auth-shell.component.html',
    styleUrls: ['./auth-shell.component.scss'],
})
export class AuthShellComponent {
    emailValue = this.route.snapshot.queryParams['email'];
    email = MsFormControl(this.emailValue || '', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [hasNoGoogleAccount(this.authService)],
    });

    constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {
        if (this.emailValue) {
            // Needed to emit statusChange event of control, after asyncValidator checked
            setTimeout(() => {
                this.email.updateValueAndValidity();
            });
        }

    }

    signInWithGoogle() {
        // TODO: Investigate why error appears from time to time
        // Cannot read property 'getAuthInstance' of undefined.
        this.authService.signInWithGoogle().subscribe();
    }

    continueWithEmail() {
        this.email.markAsTouched();
        if (this.email.invalid) return;

        this.router.navigate(['/auth/email'], { queryParams: { email: this.email.value, type: this.authService.lastRequestedSignInMethod } });
    }
}
