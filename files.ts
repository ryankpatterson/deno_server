import { ServerRequest } from "https://deno.land/std@0.65.0/http/server.ts";

interface fileAndName {
    file: Uint8Array;
    name: string;
}

/**
 * 
 * @param req the request object.
 * 
 * @typeParam fileAndName an object with file which is a Uint8Array and name which is a string.
 * 
 * @returns a promise with the information for the files sent in the form.
 */
export async function readFiles(req: ServerRequest): Promise<fileAndName[]> {
    if (!req.headers.get('content-type')?.startsWith('multipart/form-data')) {
        return [];
    }
    const buf: Uint8Array = await Deno.readAll(req.body);
    const boundary = new TextEncoder().encode(req.headers.get('content-type')?.split('; boundary=')[1]);

    const starts = findStarts(buf, boundary);

    let files: Uint8Array[] = [];
    for (let i = 0; i < starts.length - 1; i++) {
        const start = starts[i];
        const end = starts[i+1];
        const file = buf.slice(start+boundary.length, end-4);
        files.push(file);
    }
    let info: string[] = [];
    files = files.map(file => {
        let count = 0;
        for (let i = 0; i < file.length; i++) {
            if (file[i] === 10) {
                count += 1;
            }
            if (count === 4) {
                info.push(new TextDecoder().decode(file.slice(0, i+1)).trim())
                return file.slice(i+1);
            }
        }
        return new Uint8Array();
    })
    info = parseInfo(info);
    let filesAndNames: fileAndName[] = [];
    files.forEach((file, i) => {
        filesAndNames.push({file: file, name: info[i]});
    })
    return filesAndNames;
}

function parseInfo(info: string[]): string[] {
    info = info.map(item => {
        return item.split('filename=')[1].split('"')[1]
    })
    return info;
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
        const slice = buf.slice(i, i+boundary.length)
        if (boundaryEquality(boundary, slice)) {
            starts.push(i);
        }
        i++;
    }
    return starts;
}