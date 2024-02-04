import { Component } from '@angular/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { isPlatform } from '@ionic/angular';
import { register } from 'swiper/element/bundle';

register();
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
})
export class AppComponent {

    constructor() {
        if (!isPlatform('capacitor')) {
            GoogleAuth.initialize();
        }

    }
}
