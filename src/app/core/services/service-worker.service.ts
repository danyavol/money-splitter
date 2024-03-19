import { Injectable } from "@angular/core";
import { Workbox } from "workbox-window";

@Injectable({ providedIn: 'root' })
export class AppServiceWorker {

    wb = new Workbox('/service-worker.js')

    constructor() {
        if ('serviceWorker' in navigator) {
            this.wb.register();
        }
    }
}
