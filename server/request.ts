import { ServerRequest } from "https://deno.land/std@0.66.0/http/server.ts";

export class Request {
  req: ServerRequest;
  url: string;
  body: Deno.Reader;
  headers: Headers;

  constructor(req: ServerRequest) {
    this.req = req;
    this.url = req.url;
    this.body = req.body;
    this.headers = req.headers;
  }

  send(body: any) {
    this.req.respond({ body: body });
  }

  async sendFile(path: string) {
    const file = await Deno.readFile(path);
    this.req.respond({ body: file });
  }
}
