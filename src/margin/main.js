const io = require('socket.io-client');
//引入依赖包

const config = require('./config');
//引入配置文件

/**
 * 远程连接
 * @param {Object} option {host:主机地址,port:端口,name:路由名称,token:密码}
 */
let origin = (option={host:'',port:'',name:'',token:''})=>{
    config.soc = io(`${option.host}:${option.port}/${option.name}?token=${option.token}`);
}





module.exports={
    origin,
    config
}