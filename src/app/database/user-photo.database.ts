import { Injectable, inject } from "@angular/core";
import { deleteObject, getBlob, uploadBytes } from "@angular/fire/storage";
import mime from "mime";
import { Observable, defer, from, map, of, switchMap } from "rxjs";
import { CURRENT_USER_ID } from "../core/services/current-user.injector";
import { UserReferences } from "./references/users.reference";

@Injectable({ providedIn: 'root' })
export class UserPhotoDatabase {
    private ref = inject(UserReferences);
    private currentUserId$ = inject(CURRENT_USER_ID);

    // Includes removing old photo if it is exist
    updateCurrentUserPhoto(photo: File | string | null): Observable<void> {
        if (typeof photo === "string") return of(undefined); // Photo didn't change

        return this.currentUserId$.pipe(
            switchMap(userId => this.ref.getUserWithId(userId)),
            switchMap(({ photo: oldPhotoName, userId }) => {
                if (oldPhotoName) {
                    // Remove old photo in background
                    deleteObject(this.ref.userFile(userId, oldPhotoName));
                }

                if (photo) {
                    // Upload new photo
                    return from(uploadBytes(this.ref.userFile(userId, photo.name), photo)).pipe(
                        map(() => undefined)
                    )
                }

                return of(undefined);
            })
        )
    }

    getCurrentUserPhotoUrl(): Observable<string | null> {
        return this.currentUserId$.pipe(
            switchMap(userId => this.ref.getUserWithId(userId)),
            switchMap(({userId, photo}) => {
                if (!photo) return of(null);
                return defer(() => getBlob(this.ref.userFile(userId, photo)).then(blob => URL.createObjectURL(blob)))
            })
        );
    }

    getPhotoDataFromUrl(url: string): Observable<File> {
        return defer(() => fetch(url).then(async d => {
            const fileType = d.headers.get('Content-Type');
            if (!fileType) throw Error('Content-Type is not provided for profile photo');

            const ext = mime.getExtension(fileType);
            return new File([await d.blob()], `profile-photo.${ext}`, { type: fileType });
        }));
    }
}
