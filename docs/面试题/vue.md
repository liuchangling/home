1. created 和 mounted 的区别
created:在模板渲染成 html 前调用，即通常初始化某些属性值，然后再渲染成视图。
mounted:在模板渲染成 html 后调用，通常是初始化页面完成后，再对 html 的 dom 节点进行一些需要的操作

2. Vue-router 跳转和 location.href 有什么区别?
使用 location.href= /url 来跳转，简单方便，但是刷新了页面；
使用 history.pushState( /url ) ，无刷新页面，静态跳转；
使用 router.push( /url ) 来跳转，使用了diff算法，实现了按需加载，减少了 dom 的消耗。其实使用router跳转和使用 history.pushState() 没什么差别的，因为vue-router就是用了 history.pushState() ，尤其是在history 模式下。


3. vue & react 区别
数据流向的不同。react从诞生开始就推崇单向数据流，而Vue是双向数据流
数据变化的实现原理不同。react使用的是不可变数据，而Vue使用的是可变的数据
组件化通信的不同。react中我们通过使用回调函数来进行通信的，而Vue中子组件向父组件传递消息有两种方式：事件和回调函数
diff算法不同。react主要使用diff队列保存需要更新哪些DOM，得到patch树，再统一操作批量更新DOM。Vue 使用双向指针，边对比，边更新DOM


4. v-show与v-if的区别
控制手段：v-show隐藏则是为该元素添加css--display:none，dom元素依旧还在。v-if显示隐藏是将dom元素整个添加或删除

编译过程：v-if切换有一个局部编译/卸载的过程，切换过程中合适地销毁和重建内部的事件监听和子组件；v-show只是简单的基于css切换

编译条件：v-if是真正的条件渲染，它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建。只有渲染条件为假时，并不做操作，直到为真才渲染

v-show 由false变为true的时候不会触发组件的生命周期

v-if由false变为true的时候，触发组件的beforeCreate、create、beforeMount、mounted钩子，由true变为false的时候触发组件的beforeDestory、destoryed方法

性能消耗：v-if有更高的切换消耗；v-show有更高的初始渲染消耗；