import { ServerRequest } from "https://deno.land/std@0.65.0/http/server.ts";

export async function jsonBody(req: ServerRequest): Promise<any> {
    try {
        const buf: Uint8Array = await Deno.readAll(req.body);
        return JSON.parse(new TextDecoder().decode(buf));
    } catch (error) {
        throw Error('Request body is not JSON');
    }
} 