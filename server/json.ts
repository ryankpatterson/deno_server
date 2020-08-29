import { Request } from "./request.ts";

export async function jsonBody(req: Request): Promise<any> {
    try {
        const buf: Uint8Array = await Deno.readAll(req.body);
        return JSON.parse(new TextDecoder().decode(buf));
    } catch (error) {
        throw Error('Request body is not JSON');
    }
} 