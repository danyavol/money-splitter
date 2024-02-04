import { Component } from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, debounceTime, distinctUntilChanged, first, map, switchMap, tap } from 'rxjs';
import { MsFormControl } from 'src/app/core/helpers/ms-form';
import { AuthService } from 'src/app/core/services/auth.service';

function hasNoGoogleAccount(authService: AuthService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return control.valueChanges.pipe(
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

@Component({
    selector: 'app-auth-shell',
    templateUrl: './auth-shell.component.html',
    styleUrls: ['./auth-shell.component.scss'],
})
export class AuthShellComponent {
    email = MsFormControl('', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [hasNoGoogleAccount(this.authService)],
    });
    constructor(private authService: AuthService, private router: Router) {}

    signInWithGoogle() {
        this.authService.signInWithGoogle().subscribe();
    }

    continueWithEmail() {
        this.email.markAsTouched();
        if (this.email.invalid) return;

        this.router.navigateByUrl('/auth/email');
    }
}
