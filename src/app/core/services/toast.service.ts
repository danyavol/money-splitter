import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    constructor(private toastController: ToastController) {}

    async error(message: string) {
        const toast = await this.toastController.create({
            message,
            buttons: [
                {
                    text: 'Ok',
                    role: 'cancel',
                },
            ],
            color: 'danger',
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
