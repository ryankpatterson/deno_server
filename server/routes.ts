import { listenAndServe, ServerRequest } from "https://deno.land/std@0.65.0/http/server.ts";

type handler = (req: ServerRequest) => void;

interface routeAndHandler {
    route: string;
    handler: handler;
}

export class Routes {
    port: number;
    postRoutes: routeAndHandler[];
    getRoutes: routeAndHandler[]
    constructor(port: number) {
        this.port = port;
        this.postRoutes = [];
        this.getRoutes = [];
    }

    get(url: string, callback: handler) {
        this.getRoutes.push({route: url, handler: callback});
    }

    post(url: string, callback: handler) {
        this.postRoutes.push({route: url, handler: callback});
    }

    run() {
        listenAndServe({port: this.port}, (req) => {
            if (req.method == 'GET') {
                this.getRoutes.forEach(r => {
                    if (req.url.endsWith(r.route)) {
                        r.handler(req);
                    }
                })
            } else if (req.method == 'POST') {
                this.postRoutes.forEach(r => {
                    if (req.url.endsWith(r.route)) {
                        r.handler(req);
                    }
                })
            }
        })
    }
}

export async function getBody(req: ServerRequest): Promise<Uint8Array> {
    const buf: Uint8Array = await Deno.readAll(req.body);
    return buf;
}