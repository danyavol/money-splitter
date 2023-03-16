import { DateTime } from "luxon";

export const DateHelper = {
    utcToLocal(utcDate: string) {
        return DateTime.fromISO(utcDate).toISO();
    },
    localToUtc(localDateStr: string): string {
        return DateTime.fromISO(localDateStr).toUTC().toISO()
    },
    getCurrentLocalDate() {
        return DateTime.now().set({ millisecond: 0, second: 0}).toISO();
    }
};
