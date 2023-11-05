// 本文手写Promise
// Promise 核心就两个东西
// 1. 构造函数
// const p = new Prommise((resolve, reject)=>{})
// 2. then函数
// Promise A+ 规范规定 只要包含then方法 就是一个Promise
// p.then(res=>{}, err=>{})
// 题外话， then方法会直接将任务放到微任务中

// https://modernjavascript.blogspot.com/2013/08/promisesa-understanding-by-doing.html

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  #status = PENDING;
  #result = undefined;
  #cache = [];

  //  构造函数接受一个参数 executor是带有resolve 和reject 两个参数的函数。
  constructor(executor) {
    const resolve = (data) => {
      this.changeStatus(FULFILLED, data);
    };
    const reject = (error) => {
      this.changeStatus(REJECTED, error);
    };

    try {
      // Promise构造函数执行时，立即调用executor函数。
      // resolve和reject两个参数传递给executor。
      executor(resolve, reject);
    } catch (error) {
      // 只能捕获同步代码异常，对于settimeout的异常无法获取，会一致处于pending
      //  即异步错误不会影响pending状态
      reject(error);
    }
  }

  changeStatus(status, result) {
    if (this.#status === PENDING) return;
    this.#status = status;
    this.#result = result;
    this.#run();
  }

  #isPromiseLike(value) {
    return (
      value !== null &&
      (typeof value === "object" || typeof value === "function") &&
      typeof value.then === "function"
    );
  }

  // 将任务放到微队列
  #runMicroTask(func) {
    setTimeout(func, 0);
  }

  // 对于每次执行resolve 和 reject的处理 是重复代码，抽离出来
  // 1. 回调不是函数时，直接执行resolve 或者reject
  // 2. 回调是函数时，需要根据该函数返回结果执行
  // 2.1 不是thenable，根据执行结果执行resolve 或者reject
  // 2.2 是thenable（即有一个then方法）, 把resolve和reject传给then方法

  // 然后全部放到微队列里面
  #runOnce(callback, resolve, reject) {
    this.#runMicroTask(() => {
      try {
        if (typeof callback === "function") {
          // 传来的是函数
          const data = callback(this.#result);
          if (this.#isPromiseLike(data)) {
            data.then(resolve, reject);
          } else {
            resolve(data);
          }
        } else {
          // 传来的是对象
          const settled = this.#status === FULFILLED ? resolve : reject;
          settled(this.#result);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  #run() {
    if (this.#status === PENDING) return;
    while (this.#cache.length) {
      // then方法支持链式调用的核心
      const { onFulfilled, onRejected, resolve, reject } = this.#cache.shift();
      // 要判断是函数还是对象
      if (this.#status === FULFILLED) {
        this.#runOnce(onFulfilled, resolve, reject);
      } else if (this.#status === REJECTED) {
        this.#runOnce(onRejected, resolve, reject);
      }
    }
  }

  // 接受两个回调函数，返回一个Promise
  // 问题1：什么时候调用回调函数
  // 问题2：如何判断Promise 什么时候修改为完成状态 FULFILLED ？什么时候修改为拒绝状态 REJECTED？
  // **难点：不知道什么时候完成
  // 统一回复：then方法只用于记录这些函数，放到缓存中，后面的执行交给run方法处理
  // 另外 如果then传递的是object，直接返回object 如果传递的是函数则执行函数
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const task = {
        onFulfilled,
        onRejected,
        resolve,
        reject,
      };
      this.#cache.push(task);
      this.#run();
    });
  }
}

// Promise.all(iterable) 都成功时返回成功，有任何一个失败立即触发失败
MyPromise.prototype.all = function (arr) {
  return new MyPromise((resolve, reject) => {
    let len = promises.length;
    let result = new Array(len);
    let count = 0;

    function done(data, i) {
      result[i] = data;
      if (++count === len) {
        resolve(result);
      }
    }

    promises.forEach((p, index) => {
      p.then((v) => done(v, index), reject);
    });
  });
};

// Promise.allSettled(iterable) 返回一个数组，每个对象表示对应的promise结果
MyPromise.prototype.allSettled = function (arr) {
  return new MyPromise((resolve, reject) => {
    let len = promises.length;
    let result = new Array(len);
    let count = 0;

    function success(i, data) {
      result[i] = { status: FULFILLED, value: data };
      if (++count === len) {
        resolve(result);
      }
    }

    function fail(i, error) {
      result[i] = { status: REJECTED, value: error };
      if (++count === len) {
        resolve(result);
      }
    }

    promises.forEach((p, index) => {
      p.then(
        (v) => success(index, v),
        (err) => fail(index, err)
      );
    });
  });
};

// Promise.race(iteralbe) 任意一个成功或失败后，立即返回
MyPromise.race = function (promises) {
  return new MyPromise((resolve, reject) => {
    promises.forEach((p) => p.then(resolve, reject));
  });
};

// 自定义：成功n个或者失败m次时返回
MyPromise.SF = function (promises, successN, failM) {
  return new MyPromise((resolve, reject) => {
    let len = promises.length;
    let result = new Array(len);
    let s = 0;
    let f = 0;

    function success(i, data) {
      result[i] = data;
      if (++s === successN) {
        resolve(result);
      }
    }

    function fail(i, error) {
      result[i] = error;
      if (++f === failM) {
        reject(result);
      }
    }

    promises.forEach((p, index) => {
      p.then(
        (v) => success(index, v),
        (err) => fail(index, err)
      );
    });
  });
};

// Promise.any(iterable) 有一个成功时返回成功。直到全都失败返回失败
// 和race的区别是，race返回第一个有结果的（不区分成功和失败），any是找到一个成功的返回，如果都失败了返回All promises were rejected
MyPromise.prototype.any = function (arr) {
  return new MyPromise((resolve, reject) => {
    promises.forEach((p) => {
      let len = promises.length;
      let f = 0;

      function fail(i, error) {
        if (++f === len) {
          reject("All promises were rejected");
        }
      }

      p.then(resolve, fail);
    });
  });
};

// Promise.reject(reason) 返回一个状态为rejected的Promise对象
MyPromise.prototype.reject = function(reason){
  MyPromise.changeStatus(REJECTED, reason)
} 

// Promise.resolve(value) 返回一个状态为resolve的Promise对象
MyPromise.prototype.resolve = function(value){
  MyPromise.changeStatus(FULFILLED, reason)
} 