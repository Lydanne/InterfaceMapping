const im = require('./main');

im.origin({
    host:'http://localhost',
    port:'3000',
    name:'a',
    token:'1234'
});

im.get('/test1',(req,res)=>{
    //console.log(req);

    res.send({success:1,mag:req.query});    
});

im.get('/test2',(req,res)=>{
    res.send({success:1,mag:req.query}); 
});

im.get('/test3',(req,res)=>{
    res.send({success:1,mag:req.query}); 
});

im.mapping();