import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
    selector: 'app-auth-shell',
    templateUrl: './auth-shell.component.html',
    styleUrls: ['./auth-shell.component.scss'],
})
export class AuthShellComponent {
    constructor(private authService: AuthService) {}

    signInWithGoogle() {
        this.authService.signInWithGoogle().subscribe({
            next: (r) => console.log('success', r),
            error: (e) => console.log('error', e),
        });
    }
}
