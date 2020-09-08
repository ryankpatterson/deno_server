import { ServerRequest } from "https://deno.land/std@0.66.0/http/server.ts";
import { getCookies } from "https://deno.land/std@0.68.0/http/cookie.ts";

export class Request {
  req: ServerRequest;
  url: string;
  body: Deno.Reader;
  method: string;
  headers: Headers;
  params: any;

  constructor(req: ServerRequest) {
    this.req = req;
    this.url = req.url;
    this.body = req.body;
    this.headers = req.headers;
    this.method = req.method;
    this.params = {};
  }

  getParams() {
    if (this.url.includes("?")) {
      const params = this.url.split("?")[1];
      for (const param of params.split("&")) {
        const [key, val] = param.split("=");
        this.params[key] = val;
      }
    }
  }

  getCookies() {
    return getCookies(this.req);
  }

  /**
  * 
  * @returns the body in the form of a Uint8Array
  * 
  * To get JSON from the body, use the json.ts module.
  * To get FormData information use the formData.ts module.
  */
  async getBody(): Promise<Uint8Array> {
    const buf: Uint8Array = await Deno.readAll(this.req.body);
    return buf;
  }
}
