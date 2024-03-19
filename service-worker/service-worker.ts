import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { CustomSWR } from './custom-swr.strategy';
import { setCacheNameDetails } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope;

// Increment CACHE_VERSION if you want to clear the cache after release
// All cache that have different version will be removed
const CACHE_VERSION = "1";
const APP_NAME = "ms-cache";

const CACHE_PREFIX = `${APP_NAME}-v${CACHE_VERSION}`;
const DAY_IN_SECONDS = 24 * 60 * 60;
const YEAR_IN_SECONDS = DAY_IN_SECONDS * 365;

self.skipWaiting();
clientsClaim();

setCacheNameDetails({
    prefix: CACHE_PREFIX
});

clearOldCache();

precacheAndRoute(self.__WB_MANIFEST || []);

// ------------------------------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------------------------------

registerRoute(
    /https?:\/\/firebasestorage\.googleapis\.com\/.+\/currencies%2F.+\.svg\?alt=media/,
    new CustomSWR({ cacheName: getName('currency-icons'), maxAge: YEAR_IN_SECONDS })
);

registerRoute(
    /https?:\/\/fonts.gstatic.com\/s\/materialsymbolsrounded/,
    new CacheFirst({ cacheName: getName('material-symbols') })
);


// ------------------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------------------

function getName(cacheName: string) {
    return `${CACHE_PREFIX}-${cacheName}`;
}

async function clearOldCache() {
    const keys = await caches.keys();
    keys.forEach(key => {
        if (key.startsWith(APP_NAME) && !key.startsWith(CACHE_PREFIX)) {
            caches.delete(key);
        }
    });
}
