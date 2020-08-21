import { Routes } from './routes.ts';
import { readFiles } from './files.ts';

const app = new Routes(8000);
app.get('/', req => {
    req.respond({body: 'working'});
})

app.post('/', async req => {
    const files = await readFiles(req);
    files.forEach(fileAndName => {
        const {file, name} = fileAndName;
        Deno.writeFile(name, file);
    })
    req.respond({body: 'post is working'});
})


app.run();
