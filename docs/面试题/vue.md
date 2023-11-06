1. created 和 mounted 的区别
created:在模板渲染成 html 前调用，即通常初始化某些属性值，然后再渲染成视图。
mounted:在模板渲染成 html 后调用，通常是初始化页面完成后，再对 html 的 dom 节点进行一些需要的操作

2. Vue-router 跳转和 location.href 有什么区别?
使用 location.href= /url 来跳转，简单方便，但是刷新了页面；
使用 history.pushState( /url ) ，无刷新页面，静态跳转；
使用 router.push( /url ) 来跳转，使用了diff算法，实现了按需加载，减少了 dom 的消耗。其实使用router跳转和使用 history.pushState() 没什么差别的，因为vue-router就是用了 history.pushState() ，尤其是在history 模式下。



