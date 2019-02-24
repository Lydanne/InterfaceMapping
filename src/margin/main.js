const io = require('socket.io-client');
//引入依赖包

let config = require('./config');
//引入配置文件

/**
 * 远程连接
 * @param {Object} option {host:主机地址,port:端口,name:路由名称,token:密码}
 */
let origin = (option={host:'',port:'',name:'',token:''})=>{
    config.origin = option;
    config.soc = io(`${option.host}:${option.port}/${option.name}?token=${option.token}`);
    //连接远程
}

let get = (api,callback,option={maxRequest:null})=>{
    api = `/${config.origin.name}${api}`;
    config.map.push({
        type:'get',
        api,
        maxRequest:option
    });

    config.soc.on(api,(query,ret)=>{
        console.log(query);
        req.query = query;
        res.send = (data)=>{
            ret(data);
        }

        callback(req,res);
    })
}

let post = (api,callback,option={maxRequest:null})=>{
    api = `/${config.origin.name}${api}`;
    config.map.push({
        type:'post',
        api,
        maxRequest:option
    });

    config.soc.on(api,(query,ret)=>{
        console.log(query);
        req.query = query;
        res.send = (data)=>{
            ret(data);
        }

        callback(req,res);
    })
}

module.exports={
    origin,
    config,
    get,
    post
}