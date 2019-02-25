const express = require('express');
const http = require('http');
const im = require('./main');

let app = express();
app.use(express.static('./'));
let server = http.Server(app);
server.listen(3000);

im.service(app,server);
    
im.mapping(im.createRoute({name:'a',token:'1234'}));

console.log(im.config);
