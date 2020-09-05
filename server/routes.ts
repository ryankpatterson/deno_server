import {
  listenAndServe,
  ServerRequest,
} from "https://deno.land/std@0.66.0/http/server.ts";
import { Request } from "./request.ts";
import { walk } from "https://deno.land/std@0.66.0/fs/walk.ts";
import * as path from "https://deno.land/std@0.66.0/path/mod.ts";

type handler = (req: Request) => void;

interface routeAndHandler {
  route: string;
  handler: handler;
}

interface staticDir {
  route: string;
  directory: string;
}

export class Routes {
  port: number;
  postRoutes: routeAndHandler[];
  getRoutes: routeAndHandler[];
  delRoutes: routeAndHandler[];
  putRoutes: routeAndHandler[];
  staticRoutes: staticDir[];
  allRoutes: routeAndHandler[];
  constructor(port: number) {
    this.port = port;
    this.postRoutes = [];
    this.getRoutes = [];
    this.delRoutes = [];
    this.putRoutes = [];
    this.staticRoutes = [];
    this.allRoutes = [];
  }

  get(url: string, callback: (req: Request) => void) {
    this.getRoutes.push({ route: url, handler: callback });
  }

  post(url: string, callback: (req: Request) => void) {
    this.postRoutes.push({ route: url, handler: callback });
  }

  delete(url: string, callback: (req: Request) => void) {
    this.delRoutes.push({ route: url, handler: callback });
  }

  put(url: string, callback: (req: Request) => void) {
    this.putRoutes.push({ route: url, handler: callback });
  }

  all(url: string, callback: (req: Request) => void) {
    this.allRoutes.push({ route: url, handler: callback });
  }

  /**
   * 
   * Serves static files from a directory.
   * 
   * Call this method before calling app.run().
   * 
   * Multiple static folders can be used, just call app.static() multiple times
   * with the static folder.
   * 
   * @param directory the folder in which static files are held
   */
  async static(directory: string) {
    if (!(await Deno.lstat(directory)).isDirectory) {
      throw Deno.errors.NotFound;
    }
    const folder = path.basename(directory);
    for await (let entry of walk(directory)) {
      if (entry.isFile) {
        const relative = entry.path.split(folder + "\\").slice(1).join("/")
          .replace("\\", "/");
        this.staticRoutes.push({ route: relative, directory: directory });
      }
    }
  }

  /**
   * Starts the server on the port that was passed to the Routes class.
   */
  run() {
    listenAndServe({ port: this.port }, (req: ServerRequest) => {
      const request = new Request(req);
      if (!this.checkAllRoutes(request)) {
        this.incomingRequest(request);
      }
    });
  }

  incomingRequest(request: Request) {
    switch (request.method) {
      case "GET":
        if (this.staticRoutes.length > 0) {
          for (const route of this.staticRoutes) {
            if (request.url.endsWith(route.route)) {
              request.sendFile(`${route.directory}/${route.route}`);
              break;
            }
          }
        }
        this.handleRequest(this.getRoutes, request);
        break;
      case "POST":
        this.handleRequest(this.postRoutes, request);
      case "DELETE":
        this.handleRequest(this.delRoutes, request);
      case "PUT":
        this.handleRequest(this.putRoutes, request);
      default:
        break;
    }
  }

  handleRequest(methodHandlers: routeAndHandler[], req: Request) {
    methodHandlers.forEach((r) => {
      if (req.url.endsWith(r.route)) {
        r.handler(req);
      }
    });
  }

  checkAllRoutes(req: Request): boolean {
    for (const route of this.allRoutes) {
      if (req.url.endsWith(route.route)) {
        route.handler(req);
        return true;
      }
    }
    return false;
  }
}

/**
 * 
 * @param req the request object
 * @returns the body in the form of a Uint8Array
 * 
 * To get JSON from the body, use the json.ts module.
 * To get FormData information use the formData.ts module.
 */
export async function getBody(req: Request): Promise<Uint8Array> {
  const buf: Uint8Array = await Deno.readAll(req.body);
  return buf;
}
