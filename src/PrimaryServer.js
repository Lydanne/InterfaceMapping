const socketIo = require("socket.io");
const http = require("http");
const https = require("https");
const fs = require("fs");

// let configs.sslPath = {}
let io = {};//实例化socket
let index = { list: [] };//方法通道
let isLink = false;//当前是否连接
let connect = {};//当前连接对象
// let configs.limit = 10;//限制连接人数
let onlink = 0;//当前连接
// let configs.pm2 = 0//configs.pm2编号

let configs = {
    pm2 : 0,
    sslPath: {},
    limit:10
}

/**
 * 
 * @param {app} app 
 * 启动服务
 */
function startService(app) {
    let server = {};

    if (configs.sslPath.key && configs.sslPath.cert ) {
        let key = fs.readFileSync(configs.sslPath.key, "utf-8");
        let cert = fs.readFileSync(configs.sslPath.cert, "utf-8");
        let ssl = { key, cert };
        server = https.createServer(ssl, app);
        console.log("启动https");
    } else{
        server = http.createServer(app);
        console.log("启动http");
    }

    io = socketIo(server);

    io.on('connection', (socket) => {
        //-------测试通信-----------------------
        console.log(`创建连接：${socket.id}`);
        isLink = true;
        connect = socket;
        socket.on('sync', (data) => {
            console.log(`同步：`, data);
            let methods = data.methods;
            isLink = true;
            methods.forEach(item => {
                socketApi(app, socket, item.api, item.type);
            });
        });
        // socketApi(app,socket,"/sum1","get");
        // socketApi(app,socket,"/sum2","get");
        console.log("初始化" + index + isLink);

        socket.emit("init", "初始化");
        //------------------------------------

        //----------监听端口连接-----------
        socket.on('disconnect', (data) => {
            console.log(`断开连接:${data}`);
            isLink = false;
            // index.list.forEach(item=>{
            //     index[item]=1;
            // });
            index.list.forEach(item => {
                if (index[item] != 1) {
                    //重启服务
                    childProcess.exec(`pm2 restart ${configs.pm2}`);
                    return;
                }
            });
        })
        //---------------------------------
    });

    return server;
}
/**
 * 同步方法api
 * @param {app} app 
 * @param {socket} socket 
 * @param {string} api 
 * @param {string} type 
 */
function socketApi(app, socket, api, type) {
    if (!index[api]) {
        index[api] = 1;
        index.list.push(api);
    }
    console.log(api);
    app[type](api, async (req, res) => {

        if (onlink <= configs.limit) {
            onlink++;
            let a1 = await new Promise(resolve => {
                let request = {//向从服务器请求数据
                    query: req.query,
                    body: req.body,
                    headers: req.headers,
                    cookies: req.cookies,
                    signedCookies: req.signedCookies
                };
                fn(api, request).then(data => {
                    //console.log(data);
                    resolve(data);
                }).catch(err => {
                    // console.log(err);
                    resolve(err);
                });
            })
            onlink--;
            if (a1.cookie.enabled) {//兼任cookie
                a1.cookie.data.forEach((item) => {
                    res.cookie(item[0], item[1], item[2]);
                });
            }
            if (a1.clearCookie.enabled) {
                res.clearCookie(a1.clearCookie.data);
            }
            if (a1.send.enabled)
                res.send(a1.send.data).end();
        } else {
            res.send({ success: 2, msg: "服务器爆满" }).send();
        }
    });

    async function fn(api, data) {//核心函数，等待从服务器发来数据后返回到主进程
        //console.log("63" + api + index[api]);

        await socket.emit(api + index[api], data);//向远程服务器发送数据
        index[api]++;
        if (index[api] >= 100000)
            index[api] = 1;
        let a1 = await new Promise((resolve, reject) => {
            if (!isLink) {//断开连接的操作
                reject({ success: 0, msg: "连接故障" });
            }

            socket.once(api + index[api], (data) => {//监听响应数据
                //console.log(data);
                resolve(data);
            })
        })

        return a1;
    }
}

function config(sel,data) {
    configs[sel] = data;
}

module.exports = {
    connect,
    startService,
    config
}