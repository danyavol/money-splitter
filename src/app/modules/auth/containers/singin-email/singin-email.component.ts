import { Component } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { MsFormControl, MsFormGroup } from 'src/app/core/helpers/ms-form';
import { AuthService, CheckEmailResponse } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

function passwordComplexity({ value }: AbstractControl): ValidationErrors | null {
    if (value.length < 6) return { weekPassword: true };
    return null;
}

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const { password, repeatPassword } = (group  as FormGroup).controls;

    if (password.value !== repeatPassword.value) return { passwordsNotMatch: true };
    return null;
}

@Component({
  selector: 'app-singin-email',
  templateUrl: './singin-email.component.html',
  styleUrls: ['./singin-email.component.scss'],
})
export class SinginEmailComponent implements ViewWillEnter {
    email?: string;
    type?: CheckEmailResponse;
    isNewAccount = this.type === "free";

    form?: MsFormGroup<{
        name?: MsFormControl<string>;
        password: MsFormControl<string>;
        repeatPassword?: MsFormControl<string>;
    }>;

    constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService, private toastService: ToastService) {}

    ionViewWillEnter(): void {
        this.email = this.route.snapshot.queryParams['email'] as string;
        this.type = this.route.snapshot.queryParams['type'] as CheckEmailResponse;
        this.isNewAccount = this.type === "free";

        if (!this.email || !this.type) {
            this.router.navigateByUrl('/auth');
        }

        this.form = MsFormGroup({
            password: MsFormControl<string>("", [Validators.required, ...(this.isNewAccount ? [passwordComplexity]: [])]),
            ...(this.isNewAccount && {
                name: MsFormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
                repeatPassword: MsFormControl<string>("", [Validators.required])
            }),
        }, this.isNewAccount ? [passwordsMatch] : null);
    }

    submit(): void {
        this.form?.markAllAsTouched();
        if (!this.form?.valid) return;

        const { password, name } = this.form.getRawValue();

        const obs = this.isNewAccount
            ? this.authService.createUserWithEmailAndPassword(this.email!, password, name!)
            : this.authService.signInWithEmailAndPassword(this.email!, password);

        obs.subscribe({
            next: () => {
                this.router.navigateByUrl('/');
            },
            error: (error) => {
                if (error.code === "auth/wrong-password") {
                    this.toastService.error("Password is incorrect", { duration: 3000 });
                } else if (error.code === "auth/too-many-requests") {
                    this.toastService.error("Access to this account has been temporarily disabled due to many failed login attempts")
                } else {
                    throw Error(error.message);
                }
            }
        });
    }
}
