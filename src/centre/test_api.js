const request = require('request');

let i;

for(i=0;i<1000;i++)
request('http://localhost:3000/a/test?id=123',(err,body)=>{
    console.log(err,body);
    
})