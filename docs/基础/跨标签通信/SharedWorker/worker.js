
// 调试sharedWorker
// 在浏览器地址栏里面输入 `chrome://inspect// ，然后在侧边栏选中shared workers了，就可以看到浏览器，目前在运行的所有worker。点击inspect会打开一个开发者工具，然后就可以看到输出的log了。
// 链接：https://juejin.cn/post/6963519363492085790


const portPool = [];

// 监听来自主页面的消息
// 注意 这里的self 不是window 会指向SharedWorkerGlobalScope
// 而webworker的self = window
self.onconnect = function (event) {
    const port = event.ports[0];

    // 每次链接的时候要把port 加到池子里面
    portPool.push(port)


    port.addEventListener("message", function (e) {
        broadcast(e.data)
    });

    port.start();
};


// 广播
function broadcast(msg){
    portPool.forEach(port=>{
        port.postMessage(msg)
    })
}