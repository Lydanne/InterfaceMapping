const im = require('./main');

im.origin({
    host:'http://localhost',
    port:'3000',
    name:'a',
    token:'1234'
});

im.config.soc.on('/a/test',(query,res)=>{
    console.log(query);
    
    res({success:1,msg:`${query.a}`});
})
