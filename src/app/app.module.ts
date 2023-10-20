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
import { AuthLayoutComponent } from './modules/layouts/auth-layout/auth-layout.component';
import { AppLayoutComponent } from './modules/layouts/app-layout/app-layout.component';
import "./core/services/icons-registry";
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';

@NgModule({
    declarations: [AppComponent, AuthLayoutComponent, AppLayoutComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot({ mode: "md" }),
        AppRoutingModule,
        IonicStorageModule.forRoot({
            name: 'money-splitter-db',
            driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
        }),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth()),
        provideDatabase(() => getDatabase()),
        provideFirestore(() => getFirestore()),
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
