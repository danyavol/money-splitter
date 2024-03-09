import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { clientsClaim } from "workbox-core"
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)

/**
 * The current version of the service worker.
 */
const SERVICE_WORKER_VERSION = '1.0.0';

const DAY_IN_SECONDS = 24 * 60 * 60;
const MONTH_IN_SECONDS = DAY_IN_SECONDS * 30;
const YEAR_IN_SECONDS = DAY_IN_SECONDS * 365;

// ------------------------------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------------------------------

registerRoute(
    /https?:\/\/firebasestorage\.googleapis\.com\/.+\/currencies%2F.+\.svg\/\?alt=media/,
    new CacheFirst({ cacheName: 'currency-icons' }),
);

registerRoute(
    /https?:\/\/fonts.gstatic.com\/s\/materialsymbolsrounded/,
    new CacheFirst({ cacheName: 'material-symbols' })
);

// ------------------------------------------------------------------------------------------
// Messages
// ------------------------------------------------------------------------------------------

self.addEventListener('message', (event) => {
    if (event && event.data && event.data.type) {
        // return the version of this service worker
        if ('GET_VERSION' === event.data.type) {
            event.ports[0].postMessage(SERVICE_WORKER_VERSION);
        }
    }
});
