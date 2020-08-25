import { listenAndServe, ServerRequest } from "https://deno.land/std@0.65.0/http/server.ts";

type handler = (req: ServerRequest) => void;

interface routeAndHandler {
    route: string;
    handler: handler;
}

export class Routes {
    port: number;
    postRoutes: routeAndHandler[];
    getRoutes: routeAndHandler[];
    delRoutes: routeAndHandler[];
    putRoutes: routeAndHandler[];
    constructor(port: number) {
        this.port = port;
        this.postRoutes = [];
        this.getRoutes = [];
        this.delRoutes = [];
        this.putRoutes = [];
    }

    get(url: string, callback: (req: ServerRequest) => void) {
        this.getRoutes.push({route: url, handler: callback});
    }

    post(url: string, callback: (req: ServerRequest) => void) {
        this.postRoutes.push({route: url, handler: callback});
    }

    delete(url: string, callback: (req: ServerRequest) => void) {
        this.delRoutes.push({route: url, handler: callback});
    }

    put(url: string, callback: (req: ServerRequest) => void) {
        this.putRoutes.push({route: url, handler: callback});
    }

    run() {
        listenAndServe({port: this.port}, (req) => {
            switch (req.method) {
                case 'GET':
                    this.handleRequest(this.getRoutes, req);
                    break;
                case 'POST':
                    this.handleRequest(this.postRoutes, req);
                case 'DELETE':
                    this.handleRequest(this.delRoutes, req);
                case 'PUT':
                    this.handleRequest(this.putRoutes, req);
                default:
                    break;
            }
        })
    }

    handleRequest(methodHandlers: routeAndHandler[], req: ServerRequest) {
        methodHandlers.forEach(r => {
            if (req.url.endsWith(r.route)) {
                r.handler(req);
            }
        })
    }
}

export async function getBody(req: ServerRequest): Promise<Uint8Array> {
    const buf: Uint8Array = await Deno.readAll(req.body);
    return buf;
}