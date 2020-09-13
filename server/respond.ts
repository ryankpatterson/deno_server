import {
  ServerRequest,
  Response,
} from "https://deno.land/std@0.66.0/http/server.ts";
import {
  setCookie,
  Cookie,
  deleteCookie,
} from "https://deno.land/std@0.68.0/http/cookie.ts";

import { basename } from "https://deno.land/std@0.66.0/path/mod.ts";

export class Respond {
  #req: ServerRequest;
  #res: Response;
  constructor(req: ServerRequest) {
    this.#req = req;
    this.#res = {};
  }

  /**
   * This methods sends a string back to the client.
   * 
   * To send JSON use Request.sendJson
   * @param body the string back to the client
   */
  send(body: string) {
    this.#res.body = body;
    this.#req.respond(this.#res);
  }

  /**
   * 
   * @param json the javascript object to send back to the client
   */
  sendJson(json: object) {
    this.#res.body = JSON.stringify(json);
    this.#req.respond(this.#res);
  }

  cookie(name: string, value: string | object) {
    let cookie: Cookie;
    if (typeof value === "object" && value !== null) {
      const val = JSON.stringify(value);
      cookie = { name, value: val };
    } else {
      cookie = { name, value };
    }
    setCookie(this.#res, cookie);
  }

  delCookie(name: string) {
    deleteCookie(this.#res, name);
  }

  /**
   * Sends a specified file back to the client
   * 
   * @param path the path to the file that will be sent back to the client.
   */
  async sendFile(path: string) {
    const file = await Deno.readFile(path);
    this.#res.body = file;
    this.#req.respond(this.#res);
  }

  /**
   * Sends a file back to the client but as an attachment.
   * 
   * @param path the path to the file to be downloaded
   * @param filename the filename that the file will be saved as attachment as.
   */
  async download(path: string, filename = "") {
    if (!this.#res.headers) {
      this.#res.headers = new Headers();
    }
    try {
      const file = await Deno.readFile(path);
      if (filename === "") {
        filename = basename(path);
      }
      this.#res.headers.append(
        "Content-Disposition",
        `attachment; filename=${filename}`,
      );
      this.#res.body = file;
      this.#req.respond(this.#res);
    } catch (error) {
      this.#res.status = 500;
      this.#req.respond(this.#res);
      throw error;
    }
  }
}
