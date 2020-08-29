import { listenAndServe, ServerRequest } from "https://deno.land/std@0.66.0/http/server.ts";
import { Request } from "./request.ts";

type handler = (req: Request) => void;

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

    get(url: string, callback: (req: Request) => void) {
        this.getRoutes.push({route: url, handler: callback});
    }

    post(url: string, callback: (req: Request) => void) {
        this.postRoutes.push({route: url, handler: callback});
    }

    delete(url: string, callback: (req: Request) => void) {
        this.delRoutes.push({route: url, handler: callback});
    }

    put(url: string, callback: (req: Request) => void) {
        this.putRoutes.push({route: url, handler: callback});
    }

    run() {
        listenAndServe({port: this.port}, (req: ServerRequest) => {
            const request = new Request(req);
            switch (req.method) {
                case 'GET':
                    this.handleRequest(this.getRoutes, request);
                    break;
                case 'POST':
                    this.handleRequest(this.postRoutes, request);
                case 'DELETE':
                    this.handleRequest(this.delRoutes, request);
                case 'PUT':
                    this.handleRequest(this.putRoutes, request);
                default:
                    break;
            }
        })
    }

    handleRequest(methodHandlers: routeAndHandler[], req: Request) {
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