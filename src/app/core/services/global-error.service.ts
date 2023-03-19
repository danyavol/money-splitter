import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private toastService: ToastService, private zone: NgZone) {}

    handleError(error: any) {
        this.zone.run(() =>
            this.toastService.error(error?.message || 'Undefined client error')
        );
        console.error(error);
    }
}
