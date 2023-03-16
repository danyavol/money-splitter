export function roundNumber(num: number): number {
    return Math.round(num * 100) / 100;
}

export function sortByDate<T extends { date: string }>(array: T[]): T[] {
    const newArray = [...array];
    return newArray.sort((a, b) => {
        if (a.date === b.date) return 0;
        if (a.date < b.date) return 1;
        return -1;
    })
}
