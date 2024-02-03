import { DateTime } from "luxon";

export const DateHelper = {
    utcToLocal(utcDate: string): string {
        const date = DateTime.fromISO(utcDate).toISO();
        if (!date) throw Error('[date-helper.ts]: utcDate(): Unable to convert utcDate: ' + utcDate);
        return date;
    },
    localToUtc(localDateStr: string): string {
        const date = DateTime.fromISO(localDateStr).toUTC().toISO();
        if (!date) throw Error('[date-helper.ts]: localToUtc(): Unable to convert localDateStr: ' + localDateStr);
        return date;
    },
    getCurrentLocalDate() {
        return DateTime.now().set({ millisecond: 0, second: 0}).toISO();
    },
    getUtcTimestamp(): string {
        return DateTime.now().toUTC().toISO();
    }
};
