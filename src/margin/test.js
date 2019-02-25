const im = require('./main');

im.origin({
    host:'http://localhost',
    port:'3000',
    name:'a',
    token:'1234'
});

im.get('/test',(req,res)=>{
    console.log(req);

    res.send({success:1,mag:"11223344"});    
});

im.post('/test',(req,res)=>{

});

im.mapping();