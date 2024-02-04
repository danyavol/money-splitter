import { Injectable, inject } from "@angular/core";
import { Auth, GoogleAuthProvider, UserCredential, signInWithCredential } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Observable, ReplaySubject, from, of, switchMap, tap } from "rxjs";

export type CheckEmailResponse = "free" | "taken" | "google";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);
    private router = inject(Router);

    isLoggedIn = this.getIsLoggedIn();

    registerUser() {

    }

    checkEmail(email: string): Observable<CheckEmailResponse> {
        return of("free");
    }

    signInWithGoogle(): Observable<UserCredential> {
        return from(GoogleAuth.signIn()).pipe(
            switchMap(user => {
                // Forward credentials to firebase
                const credential = GoogleAuthProvider.credential(user.authentication.idToken);
                return from(signInWithCredential(this.auth, credential));
            }),
            tap({
                next: () => {
                    this.router.navigate(['/']);
                },
                error: (err) => {
                    throw Error(err);
                }
            })
        );
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
