import { LocalStorageService } from "../database/local-storage.service";
import { StaleWhileRevalidate } from "./strategies/stale-while-revalidate";

// increment cache version to clear old cache after new app deploy
export const CACHE_VERSION = '1';

const DAY = 60 * 60 * 24;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

export const rules = (storage: LocalStorageService) => [
    {
        path: /https?:\/\/firebasestorage\.googleapis\.com\/.+\/currencies%2F.+\.svg\?alt=media/,
        strategy: new StaleWhileRevalidate({ storage, rulePrefix: "currency-icons", maxAge: MONTH })
    },
    {
        path: /https?:\/\/fonts.gstatic.com\/s\/materialsymbolsrounded/,
        strategy: new StaleWhileRevalidate({ storage, rulePrefix: "material-symbols", maxAge: YEAR })
    }
];
