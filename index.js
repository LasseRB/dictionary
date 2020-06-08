const http = require('http');
const path = require('path');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    const docRoot = './';

    // domain root redirect to index.html
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = 'index.html';
    }

    // determine mime type
    let ext = String(path.extname(filePath)).toLowerCase();
    let mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    let contentType = mimeTypes[ext] || 'application/octet-stream'; // default to binary files

    // read file
    fs.readFile(docRoot + filePath, (err, buffer) => {
        if (err) {
            if (err.code === 'ENOENT') {
                fs.readFile(docRoot + '404.html', (err, buffer) => {
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    res.end(buffer, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end(`Unknown error: ${err.code}\n`);
            }
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(buffer, 'utf-8');
        }
    });
    // console.log(`${filePath} (${contentType})`);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

