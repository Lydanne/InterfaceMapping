const io = require('socket.io-client');

let soc = io('http://localhost:3000/b?token=1234');
let spc2 = io('http://localhost:3000/b?token=234');

soc.emit('msg','hi');