import { ServerRequest } from "https://deno.land/std@0.66.0/http/server.ts";

export class Request {
  req: ServerRequest;
  url: string;
  body: Deno.Reader;
  method: string;
  headers: Headers;

  constructor(req: ServerRequest) {
    this.req = req;
    this.url = req.url;
    this.body = req.body;
    this.headers = req.headers;
    this.method = req.method;
  }

  /**
   * This methods sends a string back to the client.
   * 
   * To send JSON use Request.sendJson
   * @param body the string back to the client
   */
  send(body: string) {
    this.req.respond({ body: body });
  }

  /**
   * 
   * @param json the javascript object to send back to the client
   */
  sendJson(json: object) {
    this.req.respond({ body: JSON.stringify(json) });
  }

  /**
   * Sends a specified file back to the client
   * 
   * @param path the path to the file that will be sent back to the client.
   */
  async sendFile(path: string) {
    const file = await Deno.readFile(path);
    this.req.respond({ body: file });
  }
}
