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
            console.log(`${new Date().toLocaleString()} || 用户iD:${socket.id}尝试建立连接`);
            if (query.token == token && item.linking==0) {
                //登录验证成功
                item.linking ++;
                //连接数加1
                console.log(`${new Date().toLocaleString()} || 用户iD:${socket.id}建立连接成功`);
                return next();//继续执行
            }
            console.error(`${new Date().toLocaleString()} || 用户iD:${socket.id}建立连接失败`);
            socket.disconnect();

        });

        Route[item.name].on('connection', (socket) => {
            //监听连接事件
            socket.on('disconnect', () => {
                console.error(`${new Date().toLocaleString()} || 用户iD:${socket.id}断开连接`);
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
        })
    });
}
/**
 * 接口映射
 * @param {*} socket 当前连接对象
 */
let mapping = async (socket) => {
    let app = config.app;
    //获取express实例化后的对象
    socket = await socket;
    //等待socket实例
    let interface = config.routes[socket.name].interface;
    //获取api接口列表
    //console.log(interface);
    
    for(let i = 0; i<interface.length;i++){
        //循环创建api接口
        interface[i].linking = 0;
        //当前连接人数
        app[interface[i].type](interface[i].api, (req, res) => {
            if(interface[i].linking>interface[i].option.maxRequest && interface[i].option.maxRequest){
                //限制访问
                res.send({stateCode:-1,msg:'服务器忙'}).end();
            }else{
                interface[i].linking++;
                let request = {};
                request.query = req.query;
                request.body = req.body;
                request.headers = req.headers;
                //express方法映射

                socket.emit(interface[i].api, request, (data) => {
                    res.send(data).end();
                    interface[i].linking--;
                });
            }
            
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