import { Injectable, inject } from "@angular/core";
import { DocumentReference, Firestore, doc, docData } from "@angular/fire/firestore";
import { Storage, ref } from "@angular/fire/storage";
import { Observable } from "rxjs";
import { User, UserPreferences, UserWithId } from "src/app/types/user.type";

@Injectable({ providedIn: 'root' })
export class UserReferences {
    private firestore = inject(Firestore);
    private storage = inject(Storage);

    user(userId: string) {
        return doc(this.firestore, 'users', userId) as DocumentReference<User>;
    }

    getUserWithId(userId: string) {
        return docData(this.user(userId), { idField: 'userId' }) as Observable<UserWithId>;
    }

    userPreferences(userId: string) {
        return doc(this.firestore, 'users', userId, 'settings', 'preferences') as DocumentReference<UserPreferences>
    }

    userFile(userId: string, fileName: string) {
        return ref(this.storage, `users/${userId}/${fileName}`);
    }
}
