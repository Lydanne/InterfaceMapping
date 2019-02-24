const socketIo = require("socket.io");
/*依赖包 */

let config = require('./config.js');
let Route = {};
/*引入默认配置文件 */

let service = (server) => {
    //创建socket实例
    let soc = socketIo(server);
    config.soc = soc;
}

let createRoute = (option = { name: null, token: null }) => {
    option.path = '/'+option.name;
    config.routes[option.name]=option;
    let soc = config.soc;
    let item = config.routes[option.name];
    let token = item.token;

    Route[item.name] = soc.of(item.path);
    //注册房间
    Route[item.name].use((socket, next) => {
        //验证连接
        let query = socket.handshake.query;
        //传值数据
        console.log(query);

        if (query.token == token) {
            return next();
        }
        console.error('用户验证错误');
        socket.disconnect();
    });
    Route[item.name].on('connection', (socket) => {
        //监听连接事件
        socket.on('disconnect', () => {
            console.log(socket.id + '断开连接');

        })
        
        socket.on('msg',(data)=>{
            console.log(data);
            
        })
        console.log(socket.id + '建立连接');

    })
}


module.exports = {
    config,
    service,
    createRoute
}