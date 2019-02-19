# exposedjs

[TOC]



## 包

包名称：exposedjs（暴露）

包版本：0.7.5（测试版）

包功能：类似与内网穿透。

包依赖：socket.io



## 为什么要使用exposedjs？

​	开发者想要把内网的服务器的资源映射到公网上去，开发者拥有一台公网的服务器。通过socketio建立双向通信，让后进行接口的转发，目前只能一对一映射，后面会映射多个内网服务器。



## 目录结构

exposedjs

​	|PrimaryServer.js——主服务（公网用）

​	|FollowServer.js——从服务（内网用）

## 怎么使用exposedjs？

### 一、准备

 - 一台公网服务器
 - 一台内网服务器

### 二、下载引入

```js
npm i -S exposedjs
//下载包
const exp = require('exposedjs');
//引入主服务包

const exp = require('exposedjs/FollowServer'); 
//引入从服务包
```

### 三、公网服务器代码

```js
const express = require("express");
const exp = require("exposedjs");

let app = express();
//如果填写了这个配置自动更改为https
// exp.config(,'sslPath',{
//     key:"./ssl/xxx",
//     cert:"./ssl/xx"
// })
exp.config('limit',100)； //限制访问为100 默认10
exp.config('pm2',3)//该应用的pm2 id , id默认为0
exp.startService(app).listen(8000);
//实例化app，启动映射服务，监听8000端口
```

### 四、内网服务器代码

```js
const exp = require("exposedjs/FollowServer");

exp.createSevice({
    host:"http://localhost",//远程主机
    port:8000//端口
});

exp.method("/sum1","get",(req,res)=>{
    //query:ajax data传值
    let sum = req.query.a+req.query.b;
    
    res.send(`${query.a}+${query.b}=${sum}`) ;//0.3.0修改
    //响应数据，返回到浏览器
});

exp.syncMethod();//同步
```

### 浏览器代码

```js
let data = { a: Math.floor(Math.random() * 1000), b: Math.floor(Math.random() * 1000) };
console.log(data);

$.ajax({
     type: "GET",
     url: "/sum1",
     data,
     success: function (response) {
         console.log(response.msg);

     }
});
```

### 版本信息

#### 0.7.0

    增加https

#### 0.6.1

    修改若干bug

#### 0.6.0

	增加自动重启服务功能。（需要mp2支持）
    增加简单的cookie功能。

#### 0.4.0

    优化服务器之间的传值对象，修改响应数据方式。（return {返回值} 修改为 res.send(返回值)）
    支持访问限制

#### 0.3.0

    实现大多数功能，修复大多数bug