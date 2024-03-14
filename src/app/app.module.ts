import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, provideFirestore, } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GlobalErrorHandler } from './core/services/global-error.service';
import "./core/services/icons-registry";
import "./core/services/keyboard.service";
import { SettingsService } from './core/services/settings.service';
import { AppLayoutComponent } from './modules/layouts/app-layout/app-layout.component';
import { AuthLayoutComponent } from './modules/layouts/auth-layout/auth-layout.component';
import { cacheInterceptorProvider } from './caching/caching.interceptor';

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
        provideFirestore(() => initializeFirestore(getApp(), {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager(),
            })
        })),
        provideStorage(() => getStorage()),
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
        cacheInterceptorProvider
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
