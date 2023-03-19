import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { SettingsService } from './core/services/settings.service';
import { GlobalErrorHandler } from './core/services/global-error.service';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot({ mode: "md" }),
        AppRoutingModule,
        IonicStorageModule.forRoot({
            name: 'money-splitter-db',
            driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
        }),
    ],
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        SettingsService,
        {
            provide: APP_INITIALIZER,
            useFactory: () => () => {},
            deps: [SettingsService], // To initialize a service on startup
            multi: true,
        },
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
