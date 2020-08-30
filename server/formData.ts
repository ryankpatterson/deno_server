import { Request } from "./request.ts";

/**
 * 
 * @param req the request object.
 * 
 * @returns a promise with the information for the files and other content sent in the form.
 */
export async function readFormData(req: Request) {
  if (!req.headers.get("content-type")?.startsWith("multipart/form-data")) {
    throw Error("Request is not multipart/formdata");
  }
  const buf: Uint8Array = await Deno.readAll(req.body);
  const boundary = new TextEncoder().encode(
    req.headers.get("content-type")?.split("; boundary=")[1],
  );

  const starts = findStarts(buf, boundary);

  let files: Uint8Array[] = [];
  let other: Uint8Array[] = [];
  for (let i = 0; i < starts.length - 1; i++) {
    const start = starts[i];
    const end = starts[i + 1];
    const content = buf.slice(start + boundary.length, end - 4);
    if (new TextDecoder().decode(content).includes("filename=")) {
      files.push(content);
    } else {
      other.push(content);
    }
  }

  let f = parseInfo(files, 4, "filename=");
  const filesAndNames = f.map((elem) => {
    return { files: elem.content, filename: elem.name };
  });
  let c = parseInfo(other, 3, "name=");
  const contentAndNames = c.map((elem) => {
    return { content: new TextDecoder().decode(elem.content), name: elem.name };
  });
  return { filesAndNames: filesAndNames, contentAndNames: contentAndNames };
}

function boundaryEquality(boundary: Uint8Array, arr: Uint8Array): boolean {
  for (let i = 0; i < boundary.length; i++) {
    if (boundary[i] != arr[i]) {
      return false;
    }
  }
  return true;
}

function findStarts(buf: Uint8Array, boundary: Uint8Array): number[] {
  let i = 0;
  let starts: number[] = [];
  while (i < buf.length) {
    const slice = buf.slice(i, i + boundary.length);
    if (boundaryEquality(boundary, slice)) {
      starts.push(i);
    }
    i++;
  }
  return starts;
}

function parseInfo(info: Uint8Array[], stop: number, splitOn: string) {
  return info.map((content) => {
    let count = 0;
    for (let i = 0; i < content.length; i++) {
      if (content[i] === 10) {
        count += 1;
      }
      if (count === stop) {
        const name =
          new TextDecoder().decode(content.slice(0, i + 1)).trim().split(
            splitOn,
          )[1].split('"')[1];
        return { content: content.slice(i + 1), name: name };
      }
    }
    return { content: new Uint8Array(), name: "" };
  });
}
