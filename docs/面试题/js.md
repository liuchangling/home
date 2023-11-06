# JS面试题

1. const和Object.freeze() 的区别
const 是防止变量重新分配，而 Object.freeze() 是使对象具有不可变性。

2. 统计某一字符或字符串在另一个字符串中出现的次数

```javascript
parent.split(child).length - 1
```

3. 浏览器内多个标签页之间的通信方式有哪些？
<https://xv700.gitee.io/message-communication-for-web/>
WebSocket （可跨域）
postMessage（可跨域）
Worker之SharedWorker
Server-Sent Events
localStorage
BroadcastChannel
Cookies

4. 判断数据类型的方法

```javascript
function type (obj) {
    return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g,'');
}
```

5. 服务端给客户端发送消息的方式

- websocket
- SSE <https://www.cnblogs.com/goloving/p/9196066.html>
- EventSource <https://developer.mozilla.org/zh-CN/docs/Server-sent_events/EventSource/EventSource>

6. 【TODO渡一课程】  重绘和回流是什么，如何优化
重绘是指一个元素外观的改变所触发的浏览器行为，浏览器会根据元素的新属性重新绘制，使元素呈现新的外观。
触发重绘的条件：改变元素外观属性。如：color，background-color，font-size等。

当渲染树中的一部分(或全部)因为元素的规模尺寸，布局，隐藏等改变而需要重新构建, 这就称为回流(reflow)。每个页面至少需要一次回流，就是在页面第一次加载的时候。
触发重排的条件：任何页面布局和几何属性的改变，改变元素的大小、位置

优化：

1. 浏览器自身优化，通过一个队列进行维护，定时执行重绘回流，这样可以让多次重绘回流合并为一次。
2. 合并多次DOM和样式的修改：
    - 直接修改元素的className
    - display:none; 先设置元素为none，操作完毕之后再把display置为block， 这样只会触发2次重绘重排
    - cloneNode 或者replaceChild
    - 多次重排的元素，position设置为absolute或者fixed 脱离文档流，这样变化不会影响到其他元素
    - 如果需要创建多个DOM节点，使用DocumentFragment创建完后一次性加入document

7. 【TODO渡一课程】 浏览器解析CSS选择器的过程？
<https://www.jianshu.com/p/b41f1258c044>

8. html的data-是什么
HTMLElement.dataset属性允许无论是在读取模式和写入模式下访问在 HTML或 DOM中的元素上设置的所有自定义数据属性(data-*)集。
<https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/dataset>
不支持驼峰命名法，只能用小写命名

```javascript

<div id="user" data-id="1234567890" data-user="johndoe" data-date-of-birth>John Doe
</div>

var el = document.querySelector('#user');

// el.id == 'user'
// el.dataset.id === '1234567890'
// el.dataset.user === 'johndoe'
// el.dataset.dateOfBirth === ''
```

9. 随机数组

```javascript
// 方案A
arr.sort((a, b) => Math.random() - .5)

// 方案B 从后往前遍历，然后随机(0, i+1)，交换
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    [array[i], array[j]] = [array[j], array[i]]
  }
}
```

10. script标签区别

```javascript
//  <script>、<script async>和<script defer>的区别
<script> : 加载的时候是同步的会阻塞后面代码的执行，加载立即执行。
<script async>: 异步加载，加载和执行是并行的。
<script defer>: 异步加载，需等到所有文档加载完才执行。(dom渲染后)
```

11. 浏览器中输入url到页面显示出来的过程发生了什么？
缓存寻址，DNS解析IP，TCP三次握手，HTTP链接，
如果是HTTPS，会协商加密协议，获取公钥，验证证书，之后使用私钥加密数据。
如果是websockt 通过http发送一个switch-protocols，切换协议，之后会切换到ws/wss协议
渲染DOM树，渲染CSSOM树，合并渲染，JavaScript下载与执行，下载图片等。

12. load 和 contentLoaded 的区别 【TODO渡一】
解析HTML结构。
加载外部脚本和样式表文件。
解析并执行脚本代码。//js之类的
DOM树构建完成。//DOMContentLoaded
加载图片等外部文件。
页面加载完毕。//load

13. null vs undefined区别
typeof(null) "object" 已定义但所占用内存已释放
typeof(undefined) "undefined" 未定义

14. 读代码

```javascirpt
for (var i = 0; i < 5; i++) {
    setTimeout(function() {
        console.log(i);
    }, 1000 * (i+1));
}
```

主线程执行完成后 i = 5 。检查任务队列 看见console.log  依次输出5次 5

假如把 var 换成 let，那么输出结果为0,1,2,3,4；
因为 let i 的是区块变量，每个i只能存活到大括号结束，并不会把后面的for循环的  i  值赋给前面的setTimeout中的i；
而 var i 则是局部变量，这个 i 的生命周期不受for循环的大括号限制；

如何不用es6实现呢, 使用立即函数

```javascript
for (var i = 0; i < 5; i++) {
    (function(i){
        var j = i 
        setTimeout(function() {
            console.log(j);
        }, 1000 * (j+1));

    })(i)
}
```

15. 箭头函数和普通函数的区别
this绑定的行为不一致。

箭头函数使用当前词法作用域覆盖this本来的值。根据外层（函数或者全局）作用域来决定 this 。
箭头函数的绑定无法被修改。（ new 也不行！） 比较类似 var self = this

默认的this 指向调用位置调用栈上一层。
仔细理解调用位置的概念。 找函数调用位置也不像想象中那么简单。每次传入函数都会有隐式赋值
非strict模式下最外层为window strict模式下无法绑定window，会抛异常。记住只有最后一层才会影响调用位置

```javascript
function foo() {
    console.log( this.a );
}
var obj = {
    a: 2,
    foo: foo
};
var bar = obj.foo; // 函数别名！
var a = "oops, global"; // a 是全局对象的属性
bar(); // "oops, global" this绑定的是window
obj.foo(); // 2  this绑定的是obj


function foo() {
    console.log( this.a );
}
function doFoo(fn) {
    // fn 其实引用的是 foo
    fn(); // <-- 调用位置！
}
var obj = {
    a: 2,
    foo: foo
};
var a = "oops, global"; // a 是全局对象的属性
doFoo( obj.foo ); // "oops, global"


// JavaScript 环境中内置的 setTimeout() 函数实现和下面的伪代码类似：
function setTimeout(fn,delay) {
    // 等待 delay 毫秒
    fn(); // <-- 调用位置！
}
```

call(..) 和 apply(..) 方法。
这两个方法是如何工作的呢？它们的第一个参数是一个对象，它们会把这个对象绑定到this，
接着在调用函数时指定这个 this 。因为你可以直接指定 this 的绑定对象，因此我们称之为显式绑定。

bind(..) 会返回一个硬编码的新函数，它会把参数设置为 this 的上下文并调用原始函数

1. 函数是否在 new 中调用（new 绑定）？如果是的话 this 绑定的是新创建的对象。
var bar = new foo()
2. 函数是否通过 call 、 apply （显式绑定）或者硬绑定调用？如果是的话， this 绑定的是
指定的对象。
var bar = foo.call(obj2)
3. 函数是否在某个上下文对象中调用（隐式绑定）？如果是的话， this 绑定的是那个上
下文对象。
var bar = obj1.foo()
4. 如果都不是的话，使用默认绑定。如果在严格模式下，就绑定到 undefined ，否则绑定到
全局对象。
var bar = foo()

16. new是什么
使用 new 来调用函数，或者说发生构造函数调用时，会自动执行下面的操作。
创建（或者说构造）一个全新的对象。
这个新对象会被执行 [[ 原型 ]] 连接。
这个新对象会绑定到函数调用的 this 。
如果函数没有返回其他对象，那么 new 表达式中的函数调用会自动返回这个新对象。

17. extends是什么
本质是复制
显示继承。extends就是混入。就是保存父类的属性的副本。做的事情就是把不存在的key和value复制进来。
```javascript
// 非常简单的 mixin(..) 例子 :
function mixin( sourceObj, targetObj ) {
    for (var key in sourceObj) {
        // 只会在不存在的情况下复制
        if (!(key in targetObj)) {
            targetObj[key] = sourceObj[key];
        }
    }
    return targetObj;
}
```

18. Object.create的polyfill
if (!Object.create) {
    Object.create = function(o) {
        function F(){}
        F.prototype = o;
        return new F();
    };
}


19. import和require的区别。为什么require无法被treeshaking
import 编译期
require 运行期


20. JavaScript Map 和 Object 的区别
在 Object 中， key 必须是简单数据类型（整数，字符串或者是 symbol），而在 Map 中则可以是 JavaScript 支持的所有数据类型，也就是说可以用一个 Object 来当做一个Map元素的 key。
Map 元素的顺序遵循插入的顺序，而 Object 的则没有这一特性。
Map 继承自 Object 对象。
构造方法和方法不同
Map 自身支持迭代，Object 不支持。
https://www.cnblogs.com/ysx215/p/11387938.html


21. ES6 Async/Await ,Generator 与Promise区别
https://www.jianshu.com/p/2a8cd4170765
1. Async/Await , 是基于Promise 实现的
2. Generator 函数是将函数分步骤阻塞 ，只有主动调用 next() 才能进行下一步
3. Async/Await 其实是 Generator的语法糖，yield命令后,只能是Thunk函数或Promise对象,而async函数的await命令后面,可以是Promise对象和原始类型的值

22. 函数式组件是什么
即所谓的受控组件。没有任何data ，只有可选的props
```javascript
Vue.component('my-component', {
  functional: true,
  // Props 是可选的
  props: {
    // ...
  },
  // 为了弥补缺少的实例
  // 提供第二个参数作为上下文
  render: function (createElement, context) {
    // ...
  }
})
```

23. Vue.nextTick 是什么
完成DOM更新，数据变化之后立即触发。

Vue 在内部对异步队列尝试使用原生的 Promise.then、MutationObserver 和 setImmediate，如果执行环境不支持，则会采用 setTimeout(fn, 0) 代替。

mounted 不会承诺所有的子组件也都一起被挂载。如果你希望等到整个视图都渲染完毕，可以用 vm.$nextTick 替换掉 mounted
```javascript
mounted() {
    this.$nextTick(function () {
    // Code that will run only after the
    // entire view has been rendered
    })
}
```

24. set和数组的区别
最根本的区别是数组是一个索引集合，这说明数组中的数据值按索引排序。数组就是用数字作为键名的对象
相比之下，set是一个键的集合。set不使用索引，而是使用键对数据排序。set 中的元素按插入顺序是可迭代的，它不能包含任何重复的数据。换句话说，set中的每一项都必须是惟一的。


25. 场景的BOM
navigator history location


26. 如何判断空对象
```javascript
JSON.stringify(obj) === '{}'

Object.keys(obj).length < 0
```

27. const 对象的属性可以修改吗
const 保证的并不是变量的值不能改动，而是变量指向的那个内存地
址不能改动。对于基本类型的数据（数值、字符串、布尔值），其值
就保存在变量指向的那个内存地址，因此等同于常量。
但对于引用类型的数据（主要是对象和数组）来说，变量指向数据的
内存地址，保存的只是一个指针，const 只能保证这个指针是固定不
变的，至于它指向的数据结构是不是可变的，就完全不能控制了


28. 如果 new 一个箭头函数的会怎么样
箭头函数是ES6中的提出来的，它没有prototype，也没有自己的this
指向，更不可以使用 arguments 参数，所以不能 New 一个箭头函数。
new 操作符的实现步骤如下：
1.创建一个对象
2.将构造函数的作用域赋给新对象（也就是将对象的__proto__属性
指向构造函数的 prototype 属性）
3.指向构造函数中的代码，构造函数中的 this 指向该对象（也就是
为这个对象添加属性和方法）
4.返回新的对象
所以，上面的第二、三步，箭头函数都是没有办法执行的。
