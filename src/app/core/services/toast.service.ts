import { Injectable } from '@angular/core';
import { ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    constructor(private toastController: ToastController) {}

    async error(message: string, extraOptions: ToastOptions = {}) {
        const toast = await this.toastController.create({
            message,
            buttons: [
                {
                    text: 'Ok',
                    role: 'cancel',
                },
            ],
            color: 'danger',
            ...extraOptions
        });

        await toast.present();
    }

    async success(message: string = "", duration = 3000) {
        const toast = await this.toastController.create({
            message,
            duration,
            buttons: [
                {
                    text: 'Ok',
                    role: 'cancel',
                },
            ],
            color: 'success',
        });

        await toast.present();
    }
}
