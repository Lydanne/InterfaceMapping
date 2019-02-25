const socketIo = require("socket.io");
/*依赖包 */

let config = require('./config.js');
/*引入默认配置文件 */

let Route = {};
/*当前socke实例 */

/**
 * 初始化服务
 * @param {*} app 这是个express实例化后的对象
 * @param {*} server 这是加工过的server对象
 */
let service = (app, server) => {
    //创建socket实例
    config.soc = socketIo(server);//实例化socketio
    config.app = app;
}
/**
 * 创建路由
 * @param {*} option {name:路由名称,token:路由连接密码}
 */
let createRoute = (option = { name: null, token: null }) => {
    return new Promise(resolve => {
        option.path = '/' + option.name;
        //通过option.name生成option.path
        option.linking = 0;
        //当前路由连接数
        config.routes[option.name] = option;
        //将路由信息写入config.routes
        let soc = config.soc;
        //从config对象中获取实例化后的socket
        let item = config.routes[option.name];
        //从config中获取routers中的某个信息
        let token = item.token;

        Route[item.name] = soc.of(item.path);
        //注册房间
        Route[item.name].use((socket, next) => {
            //验证连接
            let query = socket.handshake.query;
            //传值数据
            //console.log(query);
            if (query.token == token && item.linking==0) {
                //登录验证成功
                item.linking ++;
                //连接数加1
                return next();//继续执行
            }
            console.error('建立连接失败');
            socket.disconnect();

        });

        Route[item.name].on('connection', (socket) => {
            //监听连接事件
            socket.on('disconnect', () => {
                console.log(item.name + '断开连接');
                item.linking--;
                //连接数
            })

            item.id = socket.id;
            //将id存在config

            socket.on('mapping', (interface) => {
            //监听mapping事件，这个事件用用于获取映射方法
                config.routes[item.name].interface = interface;
                //将方法放在对应的routes
                socket.name = item.name;
                //用于找到是那个路由
                //console.log(interface);
                
                resolve(socket);//通过primise返回已经连接的socket
            })
            
            socket.emit('reqMapping');//请求映射
            console.log(item.name+ '建立连接');
        })
    });
}
/**
 * 接口映射
 * @param {*} app express实例化对象
 */
let mapping = async (socket) => {
    let app = config.app;
    socket = await socket;
    let interface = config.routes[socket.name].interface;

    //console.log(interface);
    
    for(let i = 0; i<interface.length;i++){
        app[interface[i].type](interface[i].api, (req, res) => {
            let request = {};
            request.query = req.query;
            request.body = req.body;
            request.headers = req.headers;

            socket.emit(interface[i].api, request, (data) => {
                res.send(data).end();
            });
        });
    }
    
}


module.exports = {
    config,
    //配置文件
    service,
    //启动服务
    createRoute,
    //创建路由
    mapping
    //映射接口
}