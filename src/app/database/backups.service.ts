import { Injectable } from "@angular/core";
import { StorageService } from "./storage.service";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { from, map, Observable, of, switchMap, tap } from "rxjs";
import { ToastService } from "../core/services/toast.service";
import { Platform } from "@ionic/angular";

@Injectable({
    providedIn: 'root'
})
export class BackupsService {
    constructor(
        private storage: StorageService,
        private toast: ToastService,
        public platform: Platform
    ) {
        this.saveBackup();
    }

    saveBackup(): Observable<void> {
        return this.storage.getAll().pipe(
            switchMap(data => {
                const dateStamp = this.getDateStamp(new Date());
                const filename = `money-splitter_${dateStamp}.json`
                const json = JSON.stringify(data);

                if (this.platform.is("desktop") || this.platform.is("mobileweb")) {
                    return this.saveFileWeb(json, filename);
                } else {
                    return this.saveFileMobile(json, filename);
                }
            }),
            tap({
                next: () => this.toast.success("Backup file has been saved to the \"Download\" folder", 5000),
                error: (e) => this.toast.error(e)
            })
        );
    }

    applyBackup(file: File) {
        return from(file.arrayBuffer()).pipe(
            map(buffer => new TextDecoder().decode(buffer)),
            map(data => JSON.parse(data)),
            switchMap(data => this.storage.setAll(data)),
            tap({
                next: () => {
                    this.toast.success("Backup has been applied", 5000)
                },
                error: (e) => this.toast.error(e)
            })
        );
    }

    private saveFileMobile(json: string, fileName: string): Observable<void> {
        return from(Filesystem.writeFile({
            path: `Download/${fileName}`,
            data: json,
            directory: Directory.ExternalStorage,
            encoding: Encoding.UTF8,
        })).pipe(map(() => undefined))
    }

    private saveFileWeb(json: string, fileName: string): Observable<void> {
        let link = document.createElement('a');
        link.download = fileName;
        let blob = new Blob([json], {type: 'text/plain'});
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        return of(undefined);
    }

    private getDateStamp(date: Date): string {
        const year = date.getFullYear();
        const month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : String(date.getMonth() + 1);
        const day = date.getDate() < 10 ? "0" + date.getDate() : String(date.getDate());
        const h = date.getHours() < 10 ? "0" + date.getHours() : String(date.getHours());
        const min = date.getMinutes() < 10 ? "0" + date.getMinutes() : String(date.getMinutes());
        const sec = date.getSeconds() < 10 ? "0" + date.getSeconds() : String(date.getSeconds());

        return `${year}${month}${day}_${h}${min}${sec}`;
    }
}
