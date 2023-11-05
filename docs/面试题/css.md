# CSS 面试题

1. 页面导入样式时，使用link和@import有什么区别？

link是HTML标签，@import是css提供的。
link引入的样式页面加载时同时加载，@import引入的样式需等页面加载完成后再加载。
link没有兼容性问题，@import不兼容ie5以下。
link可以通过js操作DOM动态引入样式表改变样式(添加disable或者移除dom节点等操作)，而@import不可以。

2. 在页面上隐藏元素的方法有哪些？
display: none
opacity: 0
visibility: hidden
z-index: -9999999999999
transform: scale(0)
margin-left或其他: -100%
position: relative 或者absolute ; left或其他: -100%
width: 0; height: 0; overflow: hidden;
filter: opacity(0);

3. css3新增伪类
*-of-type 第几个该类型的元素
-nth-child(n) 第几个子元素
-nth-of-type(n) 第几个某标签的元素
:empty 无子元素的
:target 当前活动的
:not(*)  非某标签的元素
:enable :disable 可用 、 禁用
:checked  选中的

4. css 画三角形
高宽设置为0时  四个border是三角形。调整背景色完事

5. 清除浮动的方式
伪元素 .clearfix:after {clear: both;} 最优

6. css中 : 和 ::的区别？
: 伪类
:: 伪元素
双冒号是CSS3规范中引入的，用于区分伪类和伪元素。

7. 实现圆形可点击区域
DOM 元素配合 border-radius: 50% 即可实现圆形点击区域

利用 <map> 和 <area> 标签设置圆形点击区域。参考文章:https://www.zhangxinxu.com/wordpress/2017/05/html-area-map/

利用 SVG 作出圆形，然后添加点击事件。

如果在 canvas 上，就需要画出圆形，然后计算鼠标的坐标是否落在圆内。

8. css优先级
!important > 内联样式（1000） > id 选择器（100） > class 选择器（10） > tag 标签（1） > *

当有多个选择器在一起时，权重相加计算。

9. 用一个div模拟textarea的实现
```html
<div class="edit" contenteditable="true" style="resize: both"></div>
```

10. 图文不可复制
user-select: none;

11. 英文单词的首字母大写
text-transform: capitalize;
