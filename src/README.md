# InterfaceMapping快速上手

## 安装

```bash
npm install -S interfacemapping
#安装最新版InterfaceMapping
```

## 使用

### 中心服务器（centre）

  一般中心服务器是一个公网的服务器，接下来的代码是放置在公网服务的node应用上的代码。

```js
const express = require('express');
const http = require('http');
const im = require('interfacemapping');

let app = express();
let server = http.Server(app);
server.listen(3000);//监听3000端口

im.service(app,server);
//启动服务器
    
im.mapping(im.createRoute({name:'a',token:'1234'}));
//创建路由并映射margin服务器上的api
//name为路由名称
//token为路由的密码
//每个路由目前只能连接一个margin服务器，当前用户连接后，其他用户会连接失败
```

### 边缘服务器（margin）

  边缘服务器可以是公网的也可以是内网的，下面是代码说明。

```js
const im = require('interfacemapping-margin');

im.origin({
    //远程连接
    host:'http://localhost',
    //主机地址
    port:'3000',
    //服务端口
    name:'a',
    //路由名称
    token:'1234'
    //连接密码
});

//这里就于express语法很相似
im.get('/test1',(req,res)=>{
    //req.query 获取ajax传值
    //req.headers 获取报文头
    
    res.send({success:1,mag:req.query});
    //响应数据
},{maxRequest:10});
//限制这个接口同时访问人数10，默认不限制

im.get('/test2',(req,res)=>{
    res.send({success:1,mag:req.query}); 
});

im.post('/test3',(req,res)=>{
    //req.body post的传值
    res.send({success:1,mag:req.query}); 
});

im.mapping();//映射同步接口
```

### 浏览器代码

```js
$.ajax({
      type: "get",
      url: "/a/test2",
      //注意这里必须要加上路由
      data:{a:3},
      success: function (response) {
      	 console.log(response);//{success:1,mag:{a:3}}
	  }
});
```



如果想和我一起修改这个项目，你可以去给我提交申请

有问题你也可以给我留言