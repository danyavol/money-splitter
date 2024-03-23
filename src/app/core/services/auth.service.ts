import { Injectable, inject } from "@angular/core";
import { Auth, GoogleAuthProvider, UserCredential, signInWithCredential } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { EMPTY, Observable, ReplaySubject, catchError, from, map, of, switchMap, tap, throwError } from "rxjs";
import { DatabaseService } from "src/app/database/database.service";

export type CheckEmailResponse = "free" | "password" | "google";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);
    private router = inject(Router);
    private db = inject(DatabaseService);

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

    signInWithEmailAndPassword(email: string, password: string): Observable<void> {
        return from(signInWithEmailAndPassword(this.auth, email, password)) as unknown as Observable<void>;
    }

    createUserWithEmailAndPassword(email: string, password: string, name: string,): Observable<void> {
        return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
            switchMap(credentials => this.createUserInFirestore(credentials, name)),
        );
    }

    signInWithGoogle(): Observable<void> {
        return from(GoogleAuth.signIn()).pipe(
            switchMap(user => {
                // Forward credentials to firebase
                const credential = GoogleAuthProvider.credential(user.authentication.idToken);
                return from(signInWithCredential(this.auth, credential));
            }),
            switchMap(credentials => this.createUserInFirestore(credentials)),
            tap(() => {
                this.router.navigate(['/']);
            }),
            catchError(err => {
                if (err.error === 'popup_closed_by_user') {
                    return EMPTY;
                }
                return throwError(err);
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

    private createUserInFirestore(userCredentials: UserCredential, name?: string): Observable<void> {
        const { creationTime, lastSignInTime } = userCredentials.user.metadata;

        // Existing user, do not save info
        // This check is necessary for google signIn
        if (creationTime !== lastSignInTime) return of(undefined);

        const { uid, photoURL, displayName, email } = userCredentials.user;

        if (photoURL) {
            // If photoURL exists - save this photo in own storage
            return this.db.getUserPhotoFromUrl(photoURL).pipe(
                switchMap(data => {
                    return this.db.addUserPhoto(uid, data.name, data.blob).pipe(
                        map(() => data.name)
                    );
                }),
                catchError(e => of(null)),
                switchMap(fileName => {
                    return this.db.setUser({
                        userId: uid,
                        email: email || null,
                        name: name || displayName || null,
                        photo: fileName
                    });
                })
            )
        } else {
            // Otherwise jut create new user without photo
            return this.db.setUser({
                userId: uid,
                email: email || null,
                name: name || displayName || null,
                photo: null
            });
        }
    }
}
