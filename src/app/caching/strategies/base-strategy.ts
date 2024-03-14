export abstract class BaseCacheStrategy {
    constructor(protected props: { cacheName: string }) {}

    hasCache(): boolean {
        
    }
}
