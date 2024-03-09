import { Injectable } from "@angular/core";
import { Workbox } from "workbox-window";
import { ServiceWorkerMessage } from "../interfaces/sw-messages.type";


@Injectable({ providedIn: 'root' })
export class AppServiceWorker {

    wb = new Workbox('/service-worker.js')

    constructor() {
        if ('serviceWorker' in navigator) {
            this.wb.register().then(() => {
                console.log('Service Worker registration completed')
              })
              .catch((err) => {
                console.error('Service Worker registration failed:', err)
              });
        }
    }

    sendMessage(message: ServiceWorkerMessage): Promise<unknown> {
        return new Promise((resolve, reject) => {
          this.wb.messageSW(message).then((event: MessageEvent): void => {
            if (event.data) {
              if (event.data.error) {
                reject(event.data.error)
              } else {
                resolve(event.data)
              }
            }
          })
        })
      }
}
