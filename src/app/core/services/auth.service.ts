import { Injectable, inject } from "@angular/core";
import { Auth, GoogleAuthProvider, UserCredential, signInWithCredential } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { Observable, ReplaySubject, from, map, switchMap, tap } from "rxjs";

export type CheckEmailResponse = "free" | "password" | "google";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);
    private router = inject(Router);

    lastRequestedSignInMethod: CheckEmailResponse | null = null;
    readonly isLoggedIn = this.getIsLoggedIn();

    getSignInMethods(email: string): Observable<CheckEmailResponse> {
        return from(fetchSignInMethodsForEmail(this.auth, email)).pipe(
            map(methods => {
                if (methods.length === 0) return 'free'; // ask user to create a new account
                if (methods.includes('google.com')) return 'google'; // user must to log in using google
                else return 'password'; // ask user to enter existing password
            }),
            tap(method => {
                this.lastRequestedSignInMethod = method;
            })
        );
    }

    signInWithEmailAndPassword(email: string, password: string): Observable<UserCredential> {
        return from(signInWithEmailAndPassword(this.auth, email, password));
    }

    createUserWithEmailAndPassword(email: string, password: string): Observable<UserCredential> {
        return from(createUserWithEmailAndPassword(this.auth, email, password));
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

    signOut(): Observable<void> {
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
