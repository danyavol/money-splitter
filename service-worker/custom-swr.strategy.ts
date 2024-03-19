import { Strategy, StrategyHandler, StrategyOptions } from "workbox-strategies";

/**
 * Works the same as Stale-While-Revalidate strategy of Wokbox,
 * but with possibility to add maxAge and refetch data in background
 * only if cache became stale
 */
export class CustomSWR extends Strategy {
    constructor(private options?: StrategyOptions & { maxAge?: number }) {
        super(options);
    }
    private responseIsStale(response: Response): boolean {
        const cacheTime = response.headers.get('Sw-Cache-Time');
        if (!cacheTime || !this.options?.maxAge) return true;

        const maxDate = new Date(cacheTime);
        maxDate.setTime(maxDate.getTime() + this.options.maxAge * 1000);
        return maxDate < new Date();
    }

    private sendRequest(
        request: Request,
        handler: StrategyHandler
    ): Promise<Response> {
        return handler.fetch(request).then(response => {
            const clone = response.clone();
            const headers = new Headers(clone.headers);
            headers.set('Sw-Cache-Time', new Date().toISOString());

            return response.blob().then(body => {
                handler.cachePut(request, new Response(body, {
                    headers,
                    status: clone.status,
                    statusText: clone.statusText
                }));

                return clone;
            });
        });
    }

    async _handle(
        request: Request,
        handler: StrategyHandler
    ): Promise<Response> {
        const cachedResponse = await handler.cacheMatch(request);
        if (cachedResponse) {
            if (this.responseIsStale(cachedResponse)) {
                this.sendRequest(request, handler);
            }

            return cachedResponse;
        }

        return this.sendRequest(request, handler);
    }
}
