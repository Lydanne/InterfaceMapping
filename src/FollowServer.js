const io = require("socket.io-client");
const childProcess = require("child_process");

let socket = {};//sokct实例
let methods = [];//所有的方法
let index = { list: [] };//防止数据出错
let pm2 = 0;//重启pm2编号

/**
 * @name 创建函数
 * @info 创建服务
 * @param {host:"http://",port:80} Obj 传入主机地址与主机端口
 */
function createSevice(Obj = { host: "http://localhost", port: 80 }) {
    socket = io.connect(`${Obj.host}:${Obj.port}`);
}

/**
 * 
 * @param {/} api 接口地址
 * @param {get} type 请求方式
 * @param {function} callback 回调函数
 */
function method(api = "/", type = "get", callback) {
    methods.push({ api, type });
    if (!index[api]) {
        index[api] = 1;
        index.list.push(api);
    }
    function app() {
        socket.once(api + index[api], (data) => {
            //console.log("29" + api + index[api],index);

            index[api]++;
            if (index[api] >= 100000)
                index[api] = 1;
            let request = data;
            let res = {
                send:{
                    enabled:false,
                    data:{}
                },
                cookie:{
                    enabled:false,
                    data:[]
                },
                clearCookie:{
                    enabled:false,
                    data:{}
                }
            }

            /**
             * 
             * @param {*} data 返回数据
             */


            function cookie(key, value, options = { path: '/', signed: false }) {
                res.cookie.enabled = true;
                res.cookie.data.push([key,value,options]);
            }
            function clearCookie(data) {
                res.clearCookie.enabled = true;
                res.clearCookie.data = data;
            }
            function send(data) {
                res.send.enabled = true;
                res.send.data = data;
                socket.emit(api + index[api], res);
            }
            let response = {
                send,
                cookie,
                clearCookie
            };

            callback(request, response)
            app();
        })
    }

    app();
}
/**
 * 同步函数
 */
function syncMethod() {
    socket.on("init", (data) => {
        console.log(data, index);
        socket.emit("sync", { methods });
        index.list.forEach(item=>{
            if(index[item]!=1){
                //重启服务
                childProcess.exec(`pm2 restart ${pm2}`);
                return;
            }
        });
        // index.list.forEach((item)=>{
        //     index[item] = 1;
        // });
    });
}

module.exports = {
    socket,
    methods,
    createSevice,
    method,
    syncMethod,
    pm2
}