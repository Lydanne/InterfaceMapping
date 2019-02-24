const im = require('./main');

im.origin({
    host:'http://localhost',
    port:'3000',
    name:'a',
    token:'1234'
});

im.get('/test',(req,res)=>{

});

im.post('/test',(req,res)=>{

});