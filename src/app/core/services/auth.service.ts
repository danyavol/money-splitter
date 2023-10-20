import { Injectable, inject } from "@angular/core";
import { Auth, GoogleAuthProvider, User, UserCredential } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Observable, ReplaySubject, from, of, tap } from "rxjs";

export type CheckEmailResponse = "free" | "taken" | "google";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);
    private router = inject(Router);

    isLoggedIn = this.getIsLoggedIn();
    private googleProvider = new GoogleAuthProvider();

    registerUser() {

    }

    checkEmail(email: string): Observable<CheckEmailResponse> {
        return of("free");
    }

    signInWithGoogle(): Observable<UserCredential> {
        // TODO: Fix sign in on android
        return from(signInWithPopup(this.auth, this.googleProvider)).pipe(tap(() => {
            this.router.navigate(['/']);
        }));
    }

    signOut() {
        return from(this.auth.signOut()).pipe(tap(() => {
            this.router.navigate(['/']);
        }));
    }

    private getIsLoggedIn(): Observable<boolean> {
        const sbj = new ReplaySubject<boolean>(1);
        this.auth.onAuthStateChanged(user => sbj.next(!!user));

        return sbj.asObservable();
    }
}
