  // 预留监听事件 防止之后加api要升级客户端的问题
  // type 需要操作的模块 '0': app, '1': win, '2': screen,'3': shell,'4': dialog
  // path 对象下的路径，字符串，支持用.分隔，为空时直接操作模块，
  // methodName 操作的方法名称，
  // args 剩余参数作为方法传参
  const MODULE_EUM = {
    '0': app,
    '1': win,
    '2': screen,
    '3': shell,
    '4': dialog
  }
  ipcMain.on('triggerApi', (_, type, path, methodName, ...args) => {
    console.warn(type, path, methodName, ...args)
    let handleModule = MODULE_EUM[type]
    let keys = path && path !== '' ? path.split('.') : null
    let handleClass = keys ? keys.reduce((value, key) => {
      if (value && typeof value === 'object' && key in value) {
        return value[key];
      } else {
        return undefined;
      }
    }, handleModule) : handleModule;

    if (handleClass) {
      handleClass[methodName](...args)
    }
  })
