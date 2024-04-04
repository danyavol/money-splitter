import { Injectable, inject } from "@angular/core";
import { Auth, GoogleAuthProvider, UserCredential, signInWithCredential } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { EMPTY, Observable, catchError, forkJoin, from, map, of, shareReplay, switchMap, tap, throwError } from "rxjs";
import { getDefaultPreferences } from "src/app/constants/default-pref";
import { DatabaseService } from "src/app/database/database.service";
import { CURRENT_USER } from "./current-user.injector";

export type CheckEmailResponse = "free" | "password" | "google";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);
    private router = inject(Router);
    private db = inject(DatabaseService);
    private currentUser$$ = inject(CURRENT_USER);

    readonly isLoggedIn = this.currentUser$$.pipe(map(user => !!user));

    lastRequestedSignInMethod: CheckEmailResponse | null = null;

    constructor() {
        this.auth.onAuthStateChanged(user => {
            this.currentUser$$.next(user)
        });
    }

    getCurrentUserData() {
        return this.currentUser$$.pipe(
            switchMap(user => {
                if (!user) return of(null);
                return this.db.getUser(user.uid)
            }),
            shareReplay(1)
        );
    }

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

    private createUserInFirestore(userCredentials: UserCredential, name?: string): Observable<void> {
        const { creationTime, lastSignInTime } = userCredentials.user.metadata;

        // Existing user, do not save info
        // This check is necessary for google signIn
        if (creationTime !== lastSignInTime) return of(undefined);

        const { uid, photoURL, displayName, email } = userCredentials.user;

        return this.saveNewUserPhoto(uid, photoURL).pipe(
            switchMap((fileName) => forkJoin([
                this.db.setUser({
                    email: email || "",
                    name: name || displayName || "",
                    photo: fileName
                }),
                this.db.setUserPreferences(getDefaultPreferences())
            ])),
            map(() => undefined)
        );
    }

    private saveNewUserPhoto(uid: string, photoURL: string | null): Observable<string | null> {
        if (!photoURL) return of(null);

        return this.db.getUserPhotoFromUrl(photoURL).pipe(
            switchMap(data => {
                return this.db.addUserPhoto(data.name, data.blob).pipe(
                    map(() => data.name)
                );
            }),
            catchError(e => of(null)),
        );
    }
}
