const express = require('express');
const http = require('http');
const im = require('./main');

let app = express();
let server = http.Server(app);
server.listen(3000);

im.service(server);

im.createRoute({name:'a',token:'1234'});
im.createRoute({name:'b',token:'1234'});


