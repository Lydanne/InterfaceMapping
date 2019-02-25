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
    config.soc.on('reqMapping',()=>{
        mapping();
    })
}

let get = (api,callback,option={maxRequest:null})=>{
    api = `/${config.origin.name}${api}`;
    config.interface.push({
        type:'get',
        api,
        option
    });

    config.soc.on(api,(request,response)=>{
        let req = {};
        let res = {};
        req = request;
        res.send = (data)=>{
            response(data);
        }

        callback(req,res);
    })
}

let post = (api,callback,option={maxRequest:null})=>{
    api = `/${config.origin.name}${api}`;
    config.interface.push({
        type:'post',
        api,
        option
    });

    config.soc.on(api,(request,response)=>{
        let req = {};
        let res = {};
        req = request;
        res.send = (data)=>{
            response(data);
        }

        callback(req,res);
    })
}

let mapping = ()=>{
    config.soc.emit('mapping',config.interface);
}

module.exports={
    origin,
    config,
    get,
    post,
    mapping
}